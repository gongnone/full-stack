import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * ActionButton - Themed button variants for Midnight Command
 * Story 1.4: Implements approve/kill/edit button variants with glow effects
 *
 * Usage:
 *   <ActionButton variant="approve">Approve</ActionButton>
 *   <ActionButton variant="kill">Kill</ActionButton>
 *   <ActionButton variant="edit">Edit</ActionButton>
 */

const actionButtonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        approve: [
          'bg-[#00D26A] text-black',
          'hover:shadow-[0_0_20px_rgba(0,210,106,0.15)]',
          'focus-visible:ring-[#00D26A]',
          'active:scale-[0.98]',
        ].join(' '),
        kill: [
          'bg-[#F4212E] text-white',
          'hover:shadow-[0_0_20px_rgba(244,33,46,0.15)]',
          'focus-visible:ring-[#F4212E]',
          'active:scale-[0.98]',
        ].join(' '),
        edit: [
          'bg-[#1D9BF0] text-white',
          'hover:shadow-[0_0_20px_rgba(29,155,240,0.15)]',
          'focus-visible:ring-[#1D9BF0]',
          'active:scale-[0.98]',
        ].join(' '),
        warning: [
          'bg-[#FFAD1F] text-black',
          'hover:shadow-[0_0_20px_rgba(255,173,31,0.15)]',
          'focus-visible:ring-[#FFAD1F]',
          'active:scale-[0.98]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[#8B98A5]',
          'hover:bg-[#242A33] hover:text-[#E7E9EA]',
          'focus-visible:ring-[#1D9BF0]',
        ].join(' '),
        outline: [
          'border border-[#2A3038] bg-transparent text-[#E7E9EA]',
          'hover:bg-[#242A33]',
          'focus-visible:ring-[#1D9BF0]',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'edit',
      size: 'md',
    },
  }
);

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  /** Loading state shows spinner and disables button */
  isLoading?: boolean;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(actionButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
ActionButton.displayName = 'ActionButton';

export { ActionButton, actionButtonVariants };
