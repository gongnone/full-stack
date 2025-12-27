/**
 * KillConfirmModal Component
 *
 * High-urgency confirmation for Hub Kill operations.
 * Staggered fade animations for "Pruning" effect are handled in parent.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface KillConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  hubTitle: string;
  spokeCount: number;
}

export function KillConfirmModal({
  isOpen,
  onOpenChange,
  onConfirm,
  hubTitle,
  spokeCount,
}: KillConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0F1419] border-[#F4212E]/30 shadow-[0_0_50px_rgba(244,33,46,0.1)]">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4212E]/10">
            <AlertTriangle className="h-6 w-6 text-[#F4212E]" />
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold text-[#E7E9EA]">
              Kill Entire Hub?
            </DialogTitle>
            <DialogDescription className="text-[#8B98A5] text-sm">
              You are about to discard all content from <span className="text-white font-semibold">"{hubTitle}"</span>. 
              This will affect <span className="text-[#F4212E] font-bold">{spokeCount} spokes</span>.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="bg-[#1A1F26] rounded-lg p-4 border border-[#2A3038] my-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#00D26A]/10 rounded-md mt-0.5">
              <div className="h-2 w-2 rounded-full bg-[#00D26A]" />
            </div>
            <p className="text-xs text-[#8B98A5] leading-relaxed">
              <span className="text-[#00D26A] font-semibold">Mutation Rule:</span> Any spokes you have already manually edited will be PRESERVED and moved to your manual assets.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[#8B98A5] hover:text-white hover:bg-white/5 order-2 sm:order-1"
          >
            Cancel (ESC)
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#F4212E] hover:bg-[#F4212E]/90 text-white font-bold gap-2 order-1 sm:order-2"
          >
            <Trash2 className="h-4 w-4" />
            Confirm Hub Kill (Enter)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
