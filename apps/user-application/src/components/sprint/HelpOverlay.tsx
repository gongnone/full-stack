import { motion, AnimatePresence } from 'framer-motion';
import { KEYBOARD_HINTS } from './hooks/useSprintKeyboard';
import { X } from 'lucide-react';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Sprint Keyboard Shortcuts</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {KEYBOARD_HINTS.map((hint) => (
                  <div key={hint.action} className="flex items-center justify-between group">
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {hint.action}
                    </span>
                    <div className="flex gap-2">
                      {hint.keys.map((key) => (
                        <kbd key={key} className="px-2.5 py-1 bg-background border border-border rounded text-[10px] font-mono text-foreground min-w-[36px] text-center shadow-sm uppercase font-bold">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground italic text-center leading-relaxed">
                  Enter "flow state." Target decision time: &lt; 6 seconds per content piece.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
