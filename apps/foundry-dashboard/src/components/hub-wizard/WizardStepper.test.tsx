import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WizardStepper, type Step } from './WizardStepper';

describe('WizardStepper', () => {
  const steps: Step[] = [
    { number: 1, label: 'Select Client' },
    { number: 2, label: 'Upload' },
    { number: 3, label: 'Review' },
  ];

  it('renders all steps', () => {
    render(<WizardStepper currentStep={1} steps={steps} />);
    expect(screen.getByText('Select Client')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('highlights current step', () => {
    render(<WizardStepper currentStep={2} steps={steps} />);
    const step2 = screen.getByTestId('wizard-step-2');
    expect(step2).toHaveAttribute('data-active', 'true');
    expect(step2).toHaveTextContent('2');
  });

  it('shows check icon for completed steps', () => {
    render(<WizardStepper currentStep={3} steps={steps} />);
    const step1 = screen.getByTestId('wizard-step-1');
    const step2 = screen.getByTestId('wizard-step-2');
    
    // Check for check icon (completed steps show SVG instead of number)
    // querySelector returns a Node, so we check truthiness not jest-dom matchers
    expect(step1.querySelector('svg')).toBeTruthy();
    expect(step2.querySelector('svg')).toBeTruthy();
  });

  it('calls onStepClick when clicking a completed step', () => {
    const onStepClick = vi.fn();
    render(<WizardStepper currentStep={3} steps={steps} onStepClick={onStepClick} />);
    
    const step1 = screen.getByTestId('wizard-step-1');
    fireEvent.click(step1);
    
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('does not call onStepClick when clicking current or future step', () => {
    const onStepClick = vi.fn();
    render(<WizardStepper currentStep={2} steps={steps} onStepClick={onStepClick} />);
    
    const step2 = screen.getByTestId('wizard-step-2'); // Current
    const step3 = screen.getByTestId('wizard-step-3'); // Future
    
    fireEvent.click(step2);
    fireEvent.click(step3);
    
    expect(onStepClick).not.toHaveBeenCalled();
  });
});
