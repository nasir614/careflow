import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { Loader2 } from 'lucide-react';

interface DeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function DeleteModal({ onConfirm, onCancel, isLoading }: DeleteModalProps) {
  return (
    <>
        <div className="space-y-4 p-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Confirm Deletion</h3>
                    <p className="text-sm text-muted-foreground">This action is permanent and cannot be undone.</p>
                </div>
            </div>
            <p className="text-sm">Are you sure you want to delete this item? All associated data will be removed.</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 bg-muted/50 rounded-b-lg">
            <Button className="w-full sm:w-auto" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
            </Button>
            <Button className="w-full sm:w-auto" variant="destructive" onClick={onConfirm} disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                    </>
                ) : (
                    <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </>
                )}
            </Button>
        </div>
    </>
  );
}
