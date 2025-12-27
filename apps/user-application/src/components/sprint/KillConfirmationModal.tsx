import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, Trash2 } from 'lucide-react';

interface KillConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  hubTitle: string;
  spokeCount: number;
}

export function KillConfirmationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  hubTitle,
  spokeCount,
}: KillConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-popover border-border border-t-4 border-t-destructive shadow-2xl rounded-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-destructive/10 rounded-full shadow-inner">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-foreground tracking-tight">
              Kill Hub: {hubTitle}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-base leading-relaxed">
            This will discard <span className="text-destructive font-bold underline decoration-destructive/30 underline-offset-4">{spokeCount} spokes</span> associated with this hub. 
            <br /><br />
            <div className="bg-background/50 p-4 rounded-xl border border-border/50">
              <span className="font-bold text-foreground uppercase text-xs tracking-widest block mb-1">Mutation Rule</span>
              <p className="text-sm">Any spokes you have already manually edited will <span className="text-success font-bold">SURVIVE</span> the kill.</p>
            </div>
            <br />
            <span className="text-xs italic font-mono opacity-70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              Can be undone within 30 seconds.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 gap-3">
          <AlertDialogCancel className="bg-secondary border-border text-muted-foreground hover:bg-secondary/80 hover:text-foreground rounded-xl px-6 py-2 transition-all duration-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-white font-bold gap-2 rounded-xl px-6 py-2 shadow-lg shadow-destructive/20 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            Confirm Hub Kill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
