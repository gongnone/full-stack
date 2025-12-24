/**
 * Story 3-1: Source Selection and Upload Wizard
 * High-level wrapper for the multi-step source upload wizard
 * Orchestrates the flow from source selection through upload completion
 */

import { useState, useCallback } from 'react';
import {
  WizardStepper,
  StepSelectClient,
  StepUploadSource,
  type SourceType,
  type Step,
} from '@/components/hub-wizard';

interface SourceWizardProps {
  onComplete: (sourceId: string, sourceType: SourceType, clientId: string) => void;
  onCancel?: () => void;
  initialClientId?: string;
}

const WIZARD_STEPS: Step[] = [
  { number: 1, label: 'Select Client' },
  { number: 2, label: 'Upload Source' },
];

/**
 * SourceWizard - Multi-step wizard for content source selection and upload
 *
 * Features:
 * - Client selection (Step 1)
 * - Source type selection: PDF, Text, or URL (Step 2)
 * - File upload with progress tracking
 * - Recent sources quick-select
 * - Character/word count validation
 *
 * @param onComplete - Callback when source is successfully created with sourceId, sourceType, and clientId
 * @param onCancel - Optional callback for cancel action
 * @param initialClientId - Optional pre-selected client ID
 */
export function SourceWizard({
  onComplete,
  onCancel,
  initialClientId,
}: SourceWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialClientId ? 2 : 1);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);

  const handleClientSelect = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentStep(2);
  }, []);

  const handleSourceSelect = useCallback((sourceId: string, sourceType: SourceType) => {
    if (selectedClientId) {
      onComplete(sourceId, sourceType, selectedClientId);
    }
  }, [selectedClientId, onComplete]);

  const handleStepClick = useCallback((step: number) => {
    // Only allow going back to completed steps
    if (step < currentStep && step === 1) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  return (
    <div className="space-y-6" data-testid="source-wizard">
      {/* Wizard Stepper */}
      <WizardStepper
        currentStep={currentStep}
        steps={WIZARD_STEPS}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Step 1: Select Client */}
        {currentStep === 1 && (
          <StepSelectClient
            selectedClientId={selectedClientId}
            onSelect={handleClientSelect}
          />
        )}

        {/* Step 2: Upload Source */}
        {currentStep === 2 && selectedClientId && (
          <StepUploadSource
            clientId={selectedClientId}
            onSourceSelected={handleSourceSelect}
          />
        )}
      </div>

      {/* Footer Actions */}
      {onCancel && (
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
