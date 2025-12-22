/**
 * Story 3-1: Source Selection & Upload Wizard
 * WizardStepper - 4-step progress indicator with click-to-go-back
 */

export interface Step {
  number: number;
  label: string;
}

interface WizardStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function WizardStepper({ currentStep, steps, onStepClick }: WizardStepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const isClickable = isCompleted && onStepClick;

        return (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step circle */}
            <button
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium
                transition-all duration-200
                ${isCompleted ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
              `}
              style={{
                backgroundColor: isCompleted
                  ? 'var(--approve)'
                  : isCurrent
                  ? 'var(--edit)'
                  : 'var(--bg-surface)',
                color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)',
                border: !isCompleted && !isCurrent ? '2px solid var(--border-subtle)' : 'none',
              }}
            >
              {isCompleted ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                step.number
              )}
            </button>

            {/* Step label */}
            <span
              className="ml-3 text-sm font-medium hidden sm:inline"
              style={{
                color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {step.label}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-4"
                style={{
                  backgroundColor: isCompleted ? 'var(--approve)' : 'var(--border-subtle)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
