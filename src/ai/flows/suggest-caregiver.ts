'use server';

/**
 * @fileOverview AI-powered caregiver suggestion flow.
 *
 * - suggestCaregiver - A function that suggests the most suitable caregiver for a client.
 * - SuggestCaregiverInput - The input type for the suggestCaregiver function.
 * - SuggestCaregiverOutput - The return type for the suggestCaregiver function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCaregiverInputSchema = z.object({
  clientId: z.string().describe('The ID of the client needing care.'),
  clientPreferences: z
    .string()
    .describe('The preferences of the client, such as preferred caregiver gender or language.'),
  requiredSkills: z.array(z.string()).describe('The skills required for the caregiving task.'),
  availability: z
    .string()
    .describe(
      'The availability of the client, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type SuggestCaregiverInput = z.infer<typeof SuggestCaregiverInputSchema>;

const SuggestCaregiverOutputSchema = z.object({
  caregiverId: z.string().describe('The ID of the suggested caregiver.'),
  reason: z.string().describe('The reason for suggesting this caregiver.'),
});
export type SuggestCaregiverOutput = z.infer<typeof SuggestCaregiverOutputSchema>;

export async function suggestCaregiver(input: SuggestCaregiverInput): Promise<SuggestCaregiverOutput> {
  return suggestCaregiverFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCaregiverPrompt',
  input: {schema: SuggestCaregiverInputSchema},
  output: {schema: SuggestCaregiverOutputSchema},
  prompt: `You are a care coordinator assistant. Based on the client's preferences, required skills, and availability, suggest the most suitable caregiver.

Client ID: {{{clientId}}}
Client Preferences: {{{clientPreferences}}}
Required Skills: {{#each requiredSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Availability: {{{availability}}}

Consider all these factors and provide the caregiver ID and the reason for your suggestion.`,
});

const suggestCaregiverFlow = ai.defineFlow(
  {
    name: 'suggestCaregiverFlow',
    inputSchema: SuggestCaregiverInputSchema,
    outputSchema: SuggestCaregiverOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
