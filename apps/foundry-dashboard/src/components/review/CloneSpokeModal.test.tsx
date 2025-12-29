import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CloneSpokeModal, CloneOptions } from './CloneSpokeModal';

describe('CloneSpokeModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    spokeContent: 'Test spoke content',
    spokeScore: 9.5,
    currentPlatform: 'twitter',
    isLoading: false,
  };

  it('renders correctly when open', () => {
    render(<CloneSpokeModal {...defaultProps} />);
    expect(screen.getByText('Clone Spoke')).toBeInTheDocument();
    expect(screen.getByText('Test spoke content')).toBeInTheDocument();
    expect(screen.getByText('G7: 9.5')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CloneSpokeModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Clone Spoke')).not.toBeInTheDocument();
  });

  it('defaults to "Exact Copy" mode', () => {
    render(<CloneSpokeModal {...defaultProps} />);
    // Check if Exact Copy is selected (based on button style or text)
    const exactButton = screen.getByText('Exact Copy').closest('button');
    expect(exactButton).toHaveClass('bg-[var(--edit)]');
    expect(screen.getByText('Create Exact Copy')).toBeInTheDocument();
  });

  it('switches to "New Variation" mode and shows count selector', () => {
    render(<CloneSpokeModal {...defaultProps} />);
    
    // Click Variation mode
    fireEvent.click(screen.getByText('New Variation'));
    
    expect(screen.getByText('Number of Variations')).toBeInTheDocument();
    expect(screen.getByText('Generate 1 Variation')).toBeInTheDocument();

    // Select 3 variations
    fireEvent.click(screen.getByText('3'));
    expect(screen.getByText('Generate 3 Variations')).toBeInTheDocument();
  });

  it('switches to "Different Platform" mode and shows platform selector', () => {
    render(<CloneSpokeModal {...defaultProps} />);
    
    // Click Platform mode
    fireEvent.click(screen.getByText('Different Platform'));
    
    expect(screen.getByText('Target Platform')).toBeInTheDocument();
    expect(screen.getByText('Select Platform')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Platform/i })).toBeDisabled();

    // Select LinkedIn
    fireEvent.click(screen.getByText('LinkedIn'));
    expect(screen.getByText('Clone to LinkedIn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clone to LinkedIn/i })).toBeEnabled();
  });

  it('calls onConfirm with correct options for Exact Copy', () => {
    render(<CloneSpokeModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Create Exact Copy'));
    
    expect(mockOnConfirm).toHaveBeenCalledWith({
      mode: 'exact',
      variationCount: 1,
      targetPlatform: undefined,
    });
  });

  it('calls onConfirm with correct options for Variation', () => {
    render(<CloneSpokeModal {...defaultProps} />);
    fireEvent.click(screen.getByText('New Variation'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('Generate 3 Variations'));
    
    expect(mockOnConfirm).toHaveBeenCalledWith({
      mode: 'variation',
      variationCount: 3,
      targetPlatform: undefined,
    });
  });

  it('calls onConfirm with correct options for Platform', () => {
    render(<CloneSpokeModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Different Platform'));
    fireEvent.click(screen.getByText('LinkedIn'));
    fireEvent.click(screen.getByText('Clone to LinkedIn'));
    
    expect(mockOnConfirm).toHaveBeenCalledWith({
      mode: 'platform',
      variationCount: 1,
      targetPlatform: 'linkedin',
    });
  });

  it('filters out current platform from platform options', () => {
    render(<CloneSpokeModal {...defaultProps} currentPlatform="twitter" />);
    fireEvent.click(screen.getByText('Different Platform'));
    
    expect(screen.queryByText('X / Twitter')).not.toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });
});