/**
 * SourceWizard - Unit Tests
 * Tests multi-step wizard orchestration for source selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SourceWizard } from './SourceWizard';

// Mock hub-wizard components
vi.mock('@/components/hub-wizard', () => ({
  WizardStepper: ({ currentStep, steps, onStepClick }: { currentStep: number; steps: { number: number; label: string }[]; onStepClick: (step: number) => void }) => (
    <div data-testid="wizard-stepper" data-current-step={currentStep}>
      {steps.map((step) => (
        <button key={step.number} onClick={() => onStepClick(step.number)} data-testid={`step-${step.number}`}>
          {step.label}
        </button>
      ))}
    </div>
  ),
  StepSelectClient: ({ selectedClientId, onSelect }: { selectedClientId: string | null; onSelect: (id: string) => void }) => (
    <div data-testid="step-select-client" data-selected={selectedClientId}>
      <button data-testid="select-client-btn" onClick={() => onSelect('selected-client-456')}>Choose Client</button>
    </div>
  ),
  StepUploadSource: ({ clientId, onSourceSelected }: { clientId: string; onSourceSelected: (id: string, type: string) => void }) => (
    <div data-testid="step-upload-source" data-client-id={clientId}>
      <button data-testid="upload-source-btn" onClick={() => onSourceSelected('new-source-789', 'pdf')}>Submit Source</button>
    </div>
  ),
}));

describe('SourceWizard', () => {
  const defaultProps = {
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('renders wizard container', () => {
      render(<SourceWizard {...defaultProps} />);
      expect(screen.getByTestId('source-wizard')).toBeInTheDocument();
    });

    it('renders wizard stepper', () => {
      render(<SourceWizard {...defaultProps} />);
      expect(screen.getByTestId('wizard-stepper')).toBeInTheDocument();
    });

    it('starts on step 1 when no initialClientId', () => {
      render(<SourceWizard {...defaultProps} />);
      expect(screen.getByTestId('wizard-stepper')).toHaveAttribute('data-current-step', '1');
    });

    it('shows step 1 content initially', () => {
      render(<SourceWizard {...defaultProps} />);
      expect(screen.getByTestId('step-select-client')).toBeInTheDocument();
    });

    it('does not show step 2 content initially', () => {
      render(<SourceWizard {...defaultProps} />);
      expect(screen.queryByTestId('step-upload-source')).not.toBeInTheDocument();
    });
  });

  describe('With Initial Client ID', () => {
    it('starts on step 2 when initialClientId provided', () => {
      render(<SourceWizard {...defaultProps} initialClientId="preset-client-123" />);
      expect(screen.getByTestId('wizard-stepper')).toHaveAttribute('data-current-step', '2');
    });

    it('shows step 2 content when initialClientId provided', () => {
      render(<SourceWizard {...defaultProps} initialClientId="preset-client-123" />);
      expect(screen.getByTestId('step-upload-source')).toBeInTheDocument();
    });

    it('passes initialClientId to step 2', () => {
      render(<SourceWizard {...defaultProps} initialClientId="preset-client-123" />);
      expect(screen.getByTestId('step-upload-source')).toHaveAttribute('data-client-id', 'preset-client-123');
    });
  });

  describe('Step Navigation', () => {
    it('advances to step 2 when client selected', () => {
      render(<SourceWizard {...defaultProps} />);

      fireEvent.click(screen.getByTestId('select-client-btn'));

      expect(screen.getByTestId('wizard-stepper')).toHaveAttribute('data-current-step', '2');
      expect(screen.getByTestId('step-upload-source')).toBeInTheDocument();
    });

    it('passes selected clientId to step 2', () => {
      render(<SourceWizard {...defaultProps} />);

      fireEvent.click(screen.getByTestId('select-client-btn'));

      expect(screen.getByTestId('step-upload-source')).toHaveAttribute('data-client-id', 'selected-client-456');
    });

    it('allows going back to step 1 via stepper', () => {
      render(<SourceWizard {...defaultProps} />);

      // Advance to step 2
      fireEvent.click(screen.getByTestId('select-client-btn'));
      expect(screen.getByTestId('step-upload-source')).toBeInTheDocument();

      // Click step 1 in stepper
      fireEvent.click(screen.getByTestId('step-1'));

      expect(screen.getByTestId('step-select-client')).toBeInTheDocument();
    });
  });

  describe('Completion Flow', () => {
    it('calls onComplete when source selected on step 2', () => {
      render(<SourceWizard {...defaultProps} initialClientId="preset-client-123" />);

      fireEvent.click(screen.getByTestId('upload-source-btn'));

      expect(defaultProps.onComplete).toHaveBeenCalledWith('new-source-789', 'pdf', 'preset-client-123');
    });

    it('calls onComplete with manually selected clientId', () => {
      render(<SourceWizard {...defaultProps} />);

      // Select client first
      fireEvent.click(screen.getByTestId('select-client-btn'));

      // Then upload source
      fireEvent.click(screen.getByTestId('upload-source-btn'));

      expect(defaultProps.onComplete).toHaveBeenCalledWith('new-source-789', 'pdf', 'selected-client-456');
    });
  });

  describe('Cancel Action', () => {
    it('does not render cancel button when onCancel not provided', () => {
      render(<SourceWizard {...defaultProps} />);
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      const onCancel = vi.fn();
      render(<SourceWizard {...defaultProps} onCancel={onCancel} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();
      render(<SourceWizard {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('Step Labels', () => {
    it('renders step 1 label in stepper', () => {
      render(<SourceWizard {...defaultProps} />);
      // Step label appears in the mocked WizardStepper
      expect(screen.getByTestId('step-1')).toHaveTextContent('Select Client');
    });

    it('renders step 2 label in stepper', () => {
      render(<SourceWizard {...defaultProps} />);
      expect(screen.getByTestId('step-2')).toHaveTextContent('Upload Source');
    });
  });
});
