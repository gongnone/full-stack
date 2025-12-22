import { motion } from 'framer-motion';
import { KEYBOARD_HINTS } from './hooks/useSprintKeyboard';

interface ProgressFooterProps {
  progress: number; // 0-100
  remaining: number;
  total?: number;
  currentIndex?: number;
}

export function ProgressFooter({ progress, remaining, total, currentIndex }: ProgressFooterProps) {
  return (
    <footer className="shrink-0 border-t border-border">
      {/* Progress Bar */}
      <div className="h-1 bg-card relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-success shadow-[0_0_10px_var(--color-success)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
        />
      </div>

      {/* Keyboard Hints */}
      <div className="h-10 flex items-center justify-between bg-background px-6">
        <div className="flex items-center gap-6">
          {KEYBOARD_HINTS.map((hint) => (
            <KeyboardHint
              key={hint.action}
              keys={hint.keys}
              action={hint.action}
              color={hint.color}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="text-xs font-mono text-muted-foreground tracking-tighter">
          <span className="text-foreground font-bold">{currentIndex}</span>
          <span className="mx-1">/</span>
          <span>{total}</span>
          <span className="ml-2 text-[10px] uppercase tracking-widest">({remaining} remaining)</span>
        </div>
      </div>
    </footer>
  );
}

interface KeyboardHintProps {
  keys: readonly string[];
  action: string;
  color: string;
}

const hintColors: Record<string, string> = {
  kill: 'text-destructive',
  edit: 'text-info',
  approve: 'text-success',
  warning: 'text-warning',
  muted: 'text-muted-foreground',
};

function KeyboardHint({ keys, action, color }: KeyboardHintProps) {
  const colorClass = hintColors[color] || 'text-slate-500';

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-xs">
        <span className="font-mono text-slate-400">
          {keys.join('/')}
        </span>
        <span className={colorClass}>{action}</span>
      </span>
    </div>
  );
}
