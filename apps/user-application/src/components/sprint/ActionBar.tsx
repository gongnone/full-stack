/**
 * ActionBar Component
 *
 * Kill / Edit / Approve action buttons with keyboard hints.
 * Primary interaction UI for sprint decisions.
 */

import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, ArrowRight, SkipForward } from 'lucide-react';

interface ActionBarProps {
  onKill: () => void;
  onEdit: () => void;
  onSkip: () => void;
  onApprove: () => void;
  disabled?: boolean;
}

export function ActionBar({
  onKill,
  onEdit,
  onSkip,
  onApprove,
  disabled = false,
}: ActionBarProps) {
  return (
    <div className="w-full max-w-[880px] bg-card/40 rounded-lg border border-border p-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-center gap-8">
        {/* Kill Button */}
        <ActionButton
          variant="kill"
          icon={<ArrowLeft className="h-5 w-5" />}
          label="KILL"
          hint="←"
          onClick={onKill}
          disabled={disabled}
        />

        {/* Edit Button */}
        <ActionButton
          variant="edit"
          icon={<Pencil className="h-5 w-5" />}
          label="EDIT"
          hint="E"
          onClick={onEdit}
          disabled={disabled}
        />

        {/* Skip Button */}
        <ActionButton
          variant="skip"
          icon={<SkipForward className="h-5 w-5" />}
          label="SKIP"
          hint="SPACE"
          onClick={onSkip}
          disabled={disabled}
        />

        {/* Approve Button */}
        <ActionButton
          variant="approve"
          icon={<ArrowRight className="h-5 w-5" />}
          label="APPROVE"
          hint="→"
          onClick={onApprove}
          disabled={disabled}
          iconPosition="right"
        />
      </div>
    </div>
  );
}

interface ActionButtonProps {
  variant: 'kill' | 'edit' | 'approve' | 'skip';
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  kill: {
    base: 'border-destructive text-destructive bg-destructive/10',
    hover: 'hover:bg-destructive/20 hover:border-destructive',
    glow: 'hover:shadow-[0_0_20px_var(--color-destructive)]/30',
  },
  edit: {
    base: 'border-info text-info bg-info/10',
    hover: 'hover:bg-info/20 hover:border-info',
    glow: 'hover:shadow-[0_0_20px_var(--color-info)]/30',
  },
  approve: {
    base: 'border-success text-success bg-success/10',
    hover: 'hover:bg-success/20 hover:border-success',
    glow: 'hover:shadow-[0_0_20px_var(--color-success)]/30',
  },
  skip: {
    base: 'border-warning text-warning bg-warning/10',
    hover: 'hover:bg-warning/20 hover:border-warning',
    glow: 'hover:shadow-[0_0_20px_var(--color-warning)]/30',
  },
};

function ActionButton({
  variant,
  icon,
  label,
  hint,
  onClick,
  disabled = false,
  iconPosition = 'left',
}: ActionButtonProps) {
  const styles = variantStyles[variant];

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-40 h-12 font-semibold transition-all duration-200
        ${styles.base}
        ${!disabled && styles.hover}
        ${!disabled && styles.glow}
        ${disabled && 'opacity-50 cursor-not-allowed'}
      `}
    >
      <span className="flex items-center gap-2">
        {iconPosition === 'left' && icon}
        <span className="flex items-center gap-1">
          <span className="font-mono text-xs opacity-60">{hint}</span>
          <span>{label}</span>
        </span>
        {iconPosition === 'right' && icon}
      </span>
    </Button>
  );
}
