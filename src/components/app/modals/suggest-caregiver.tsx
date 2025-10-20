'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, UserCheck } from 'lucide-react';
import { suggestCaregiver } from '@/ai/flows/suggest-caregiver';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export default function SuggestCaregiver() {
  const [suggestion, setSuggestion] = useState<{ caregiverId: string, reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedItem, staff, setSchedules, closeModal } = useCareFlow();
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!selectedItem || !('clientId' in selectedItem)) return;

    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestCaregiver({
        clientId: String(selectedItem.clientId),
        clientPreferences: "Prefers a caregiver who speaks Spanish.",
        requiredSkills: ["Personal Care", "Medication Reminders"],
        availability: "data:text/plain;base64,TW9uLVdlZC1Gcmkg mornings",
      });
      setSuggestion(result);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        title: "AI Suggestion Failed",
        description: "Could not get a suggestion at this time.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const applySuggestion = () => {
    if (!suggestion || !selectedItem || !('id' in selectedItem)) return;
    const suggestedStaff = staff.find(s => String(s.id) === suggestion.caregiverId);
    if (suggestedStaff) {
        setSchedules(prev => prev.map(s => s.id === selectedItem.id ? { ...s, staffId: suggestedStaff.id, staffName: suggestedStaff.name } : s));
        toast({ title: "Suggestion Applied", description: `${suggestedStaff.name} has been assigned.` });
        closeModal();
    } else {
        toast({ title: "Error", description: `Staff with ID ${suggestion.caregiverId} not found.`, variant: 'destructive'});
    }
  };

  return (
    <div className="p-4 space-y-4">
      {!suggestion && !isLoading && (
         <div className="text-center space-y-4 py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Find the perfect match</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">Let AI analyze client needs, staff skills, and availability to recommend the most suitable caregiver.</p>
            <Button onClick={handleSuggest}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Suggestion
            </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">AI is thinking...</p>
        </div>
      )}

      {suggestion && (
        <div className="space-y-4">
            <Card className="bg-primary/5">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Recommended Caregiver</p>
                            <p className="text-xl font-semibold">
                                {staff.find(s => String(s.id) === suggestion.caregiverId)?.name || 'Unknown Staff'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold mb-1">Reasoning:</p>
                        <p className="text-sm text-muted-foreground italic">"{suggestion.reason}"</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSuggestion(null)}>Try Again</Button>
                <Button onClick={applySuggestion}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Apply Suggestion
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
