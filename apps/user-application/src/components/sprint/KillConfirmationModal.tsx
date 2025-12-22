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
      <AlertDialogContent className="bg-slate-900 border-slate-800 border-t-4 border-t-red-500">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-100">
              Kill Hub: {hubTitle}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-400 text-base">
            This will discard <span className="text-red-400 font-bold">{spokeCount} spokes</span> associated with this hub. 
            <br /><br />
            <span className="font-semibold text-slate-200">Mutation Rule:</span> Any spokes you have already manually edited will SURVIVE the kill.
            <br /><br />
            <span className="text-xs italic">You can undo this action within 30 seconds.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-500 text-white font-bold gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Confirm Hub Kill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
