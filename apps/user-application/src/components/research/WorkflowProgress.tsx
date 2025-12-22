/**
 * WorkflowProgress Component
 *
 * Displays realistic step-based progress for the Halo Research Workflow.
 * Shows actual phase completion status based on currentStep from database.
 */

import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Workflow step metadata matching halo-workflow-v2.ts
const WORKFLOW_STEPS = [
    {
        id: 'phase-1-discovery',
        completedStep: 'discovery_complete',
        label: 'Discovery',
        description: 'Finding watering holes & audiences',
        estimatedSeconds: 45,
        icon: '🔍'
    },
    {
        id: 'phase-1.5-competitor',
        completedStep: 'competitor_complete',
        label: 'Competitor Recon',
        description: 'Analyzing competitor offers & gaps',
        estimatedSeconds: 60,
        icon: '🎯'
    },
    {
        id: 'phase-2-listening',
        completedStep: 'listening_complete',
        label: 'Deep Listening',
        description: 'Extracting verbatim content',
        estimatedSeconds: 120,
        icon: '👂'
    },
    {
        id: 'phase-3-classification',
        completedStep: 'classification_complete',
        label: 'Classification',
        description: 'Categorizing by sophistication',
        estimatedSeconds: 90,
        icon: '📊'
    },
    {
        id: 'phase-4-avatar',
        completedStep: 'avatar_complete',
        label: 'Avatar Synthesis',
        description: 'Building dream buyer profile',
        estimatedSeconds: 60,
        icon: '👤'
    },
    {
        id: 'phase-5-problem',
        completedStep: 'problem_complete',
        label: 'Problem ID',
        description: 'Finding hair-on-fire problems',
        estimatedSeconds: 45,
        icon: '🔥'
    },
    {
        id: 'phase-6-hvco',
        completedStep: 'hvco_complete',
        label: 'HVCO Generation',
        description: 'Creating title variants',
        estimatedSeconds: 45,
        icon: '✨'
    },
    {
        id: 'save-results',
        completedStep: 'complete',
        label: 'Saving Results',
        description: 'Storing research data',
        estimatedSeconds: 10,
        icon: '💾'
    }
] as const;

// Map currentStep values to completed phase index
function getCompletedPhaseIndex(currentStep: string | null | undefined): number {
    if (!currentStep) return -1;
    if (currentStep === 'complete') return WORKFLOW_STEPS.length;

    const stepIndex = WORKFLOW_STEPS.findIndex(s => s.completedStep === currentStep);
    return stepIndex;
}

// Get currently running phase
function getCurrentPhaseIndex(currentStep: string | null | undefined): number {
    const completedIndex = getCompletedPhaseIndex(currentStep);
    // The running phase is one after the last completed
    return Math.min(completedIndex + 1, WORKFLOW_STEPS.length - 1);
}

interface WorkflowProgressProps {
    currentStep: string | null | undefined;
    status: string;
    isRefetching?: boolean;
}

export function WorkflowProgress({ currentStep, status, isRefetching }: WorkflowProgressProps) {
    const completedIndex = getCompletedPhaseIndex(currentStep);
    const currentIndex = getCurrentPhaseIndex(currentStep);
    const isError = status === 'failed' || status === 'error';
    const isComplete = status === 'complete' || currentStep === 'complete';

    // Calculate overall progress percentage
    const progressPercent = isComplete
        ? 100
        : Math.round(((completedIndex + 1) / WORKFLOW_STEPS.length) * 100);

    // Estimate remaining time
    const remainingSteps = WORKFLOW_STEPS.slice(currentIndex);
    const estimatedRemainingSeconds = remainingSteps.reduce((sum, s) => sum + s.estimatedSeconds, 0);
    const estimatedMinutes = Math.ceil(estimatedRemainingSeconds / 60);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header with status */}
            <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-2">
                    {isError ? (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                    ) : (
                        <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    )}
                    <span className="uppercase tracking-wider">
                        {isError
                            ? 'WORKFLOW ERROR'
                            : WORKFLOW_STEPS[currentIndex]?.label || 'INITIALIZING'}
                    </span>
                </span>
                <span className="flex items-center gap-3">
                    {!isError && !isComplete && (
                        <span className="text-muted-foreground/70">
                            ~{estimatedMinutes} min remaining
                        </span>
                    )}
                    <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                        isRefetching ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    )}>
                        {isRefetching ? "SYNCING" : "LIVE"}
                    </span>
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full transition-all duration-700 ease-out",
                        isError ? "bg-red-500" : "bg-blue-600"
                    )}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Step indicators */}
            <div className="grid grid-cols-4 gap-2 text-[10px]">
                {WORKFLOW_STEPS.slice(0, 8).map((step, index) => {
                    const isStepComplete = index <= completedIndex;
                    const isStepCurrent = index === currentIndex && !isComplete;
                    const isStepPending = index > currentIndex;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-1.5 p-1.5 rounded transition-all duration-300",
                                isStepComplete && "bg-green-50 text-green-700",
                                isStepCurrent && "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
                                isStepPending && "text-muted-foreground/50",
                                isError && isStepCurrent && "bg-red-50 text-red-700 ring-red-200"
                            )}
                        >
                            <span className="flex-shrink-0">
                                {isStepComplete ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : isStepCurrent ? (
                                    isError ? (
                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                    ) : (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    )
                                ) : (
                                    <Circle className="h-3 w-3" />
                                )}
                            </span>
                            <span className="truncate font-medium">
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Current step description */}
            {!isError && !isComplete && WORKFLOW_STEPS[currentIndex] && (
                <p className="text-xs text-muted-foreground text-center animate-pulse">
                    {WORKFLOW_STEPS[currentIndex].icon} {WORKFLOW_STEPS[currentIndex].description}...
                </p>
            )}

            {isError && (
                <p className="text-xs text-red-600 text-center">
                    Research encountered an error. Please try again.
                </p>
            )}
        </div>
    );
}

// Compact variant for smaller spaces
export function WorkflowProgressCompact({ currentStep, status }: WorkflowProgressProps) {
    const completedIndex = getCompletedPhaseIndex(currentStep);
    const currentIndex = getCurrentPhaseIndex(currentStep);
    const isComplete = status === 'complete' || currentStep === 'complete';
    const progressPercent = isComplete
        ? 100
        : Math.round(((completedIndex + 1) / WORKFLOW_STEPS.length) * 100);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{WORKFLOW_STEPS[currentIndex]?.label || 'Processing'}</span>
                <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
