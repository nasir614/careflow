'use server';
/**
 * @fileOverview Optimizes caregiver schedules to minimize travel time and maximize caregiver efficiency.
 *
 * - optimizeCaregiverRoutes - A function that optimizes caregiver schedules.
 * - OptimizeCaregiverRoutesInput - The input type for the optimizeCaregiverRoutes function.
 * - OptimizeCaregiverRoutesOutput - The return type for the optimizeCaregiverRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCaregiverRoutesInputSchema = z.object({
  caregiverSchedules: z.string().describe('JSON string of current caregiver schedules, including client addresses and caregiver availability.'),
  clientPreferences: z.string().describe('JSON string of client preferences, including preferred caregivers and appointment times.'),
  travelTimeMatrix: z.string().describe('JSON string of travel time matrix between client locations.'),
});
export type OptimizeCaregiverRoutesInput = z.infer<typeof OptimizeCaregiverRoutesInputSchema>;

const OptimizeCaregiverRoutesOutputSchema = z.object({
  optimizedSchedules: z.string().describe('JSON string of optimized caregiver schedules, minimizing travel time and maximizing caregiver efficiency.'),
  summary: z.string().describe('A summary of the changes made to the schedules and the benefits of the optimization.'),
});
export type OptimizeCaregiverRoutesOutput = z.infer<typeof OptimizeCaregiverRoutesOutputSchema>;

export async function optimizeCaregiverRoutes(input: OptimizeCaregiverRoutesInput): Promise<OptimizeCaregiverRoutesOutput> {
  return optimizeCaregiverRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCaregiverRoutesPrompt',
  input: {schema: OptimizeCaregiverRoutesInputSchema},
  output: {schema: OptimizeCaregiverRoutesOutputSchema},
  prompt: `You are an expert in logistics and scheduling, specializing in optimizing caregiver routes for home health agencies.

You are provided with the following information:

- Current Caregiver Schedules: {{{caregiverSchedules}}}
- Client Preferences: {{{clientPreferences}}}
- Travel Time Matrix: {{{travelTimeMatrix}}}

Analyze this information and generate optimized caregiver schedules that minimize travel time between clients and maximize the number of clients each caregiver can serve in a day.

Consider the following factors:

- Caregiver availability and skills
- Client preferences for caregivers and appointment times
- Travel time between client locations
- Minimizing overall travel costs

Output the optimized schedules in JSON format and provide a summary of the changes made and the benefits of the optimization. Be sure to take all information into account when generating schedules.
`,
});

const optimizeCaregiverRoutesFlow = ai.defineFlow(
  {
    name: 'optimizeCaregiverRoutesFlow',
    inputSchema: OptimizeCaregiverRoutesInputSchema,
    outputSchema: OptimizeCaregiverRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
