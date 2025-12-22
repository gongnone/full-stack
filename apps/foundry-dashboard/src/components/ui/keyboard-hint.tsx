import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * KeyboardHint - Displays keyboard shortcuts
 * Story 1.4: Themed keyboard hint for power user shortcuts
 *
 * Usage:
 *   <KeyboardHint keys={['Cmd', 'K']} action="Open command palette" />
 *   <KeyboardHint keys={['←']} action="Kill" />
 */

export interface KeyboardHintProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of key names to display */
  keys: string[];
  /** Action description (optional) */
  action?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

const KeyboardHint = React.forwardRef<HTMLDivElement, KeyboardHintProps>(
  ({ className, keys, action, size = 'sm', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-xs gap-1',
      md: 'text-sm gap-1.5',
    };

    const keyClasses = {
      sm: 'px-1.5 py-0.5 min-w-[1.25rem]',
      md: 'px-2 py-1 min-w-[1.5rem]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-0.5">
          {keys.map((key, index) => (
            <React.Fragment key={index}>
              <kbd
                className={cn(
                  'inline-flex items-center justify-center rounded font-mono',
                  'bg-[#1A1F26] text-[#6E767D] border border-[#2A3038]',
                  keyClasses[size]
                )}
              >
                {key}
              </kbd>
              {index < keys.length - 1 && (
                <span className="text-[#6E767D]">+</span>
              )}
            </React.Fragment>
          ))}
        </span>
        {action && (
          <span className="text-[#6E767D] ml-2">{action}</span>
        )}
      </div>
    );
  }
);
KeyboardHint.displayName = 'KeyboardHint';

export { KeyboardHint };
