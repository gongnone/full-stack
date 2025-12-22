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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-100">Sprint Keyboard Shortcuts</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {KEYBOARD_HINTS.map((hint) => (
                  <div key={hint.action} className="flex items-center justify-between group">
                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                      {hint.action}
                    </span>
                    <div className="flex gap-2">
                      {hint.keys.map((key) => (
                        <kbd key={key} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300 min-w-[32px] text-center shadow-inner">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-500 italic text-center">
                  Target decision time: &lt; 6 seconds per content piece.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
