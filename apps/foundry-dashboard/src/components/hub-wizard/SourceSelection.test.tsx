import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SourceSelection } from './SourceSelection';

describe('SourceSelection', () => {
  const onSelect = vi.fn();

  it('renders all source options', () => {
    render(<SourceSelection selectedType={null} onSelect={onSelect} disabledTypes={[]} />);
    expect(screen.getByText('PDF Document')).toBeInTheDocument();
    expect(screen.getByText('Paste Text')).toBeInTheDocument();
    expect(screen.getByText('Web URL')).toBeInTheDocument();
  });

  it('handles text selection', () => {
    render(<SourceSelection selectedType={null} onSelect={onSelect} disabledTypes={[]} />);
    
    // Find text option button (closest button to title)
    const textOption = screen.getByText('Paste Text').closest('button');
    fireEvent.click(textOption!);
    
    expect(onSelect).toHaveBeenCalledWith('text');
  });

  it('disables specified types', () => {
    render(
      <SourceSelection 
        selectedType={null} 
        onSelect={onSelect} 
        disabledTypes={['pdf']} 
      />
    );

    const pdfOption = screen.getByText('PDF Document').closest('button');
    expect(pdfOption).toBeDisabled();
    
    fireEvent.click(pdfOption!);
    expect(onSelect).not.toHaveBeenCalledWith('pdf');
  });

  it('shows badges', () => {
    render(<SourceSelection selectedType={null} onSelect={onSelect} disabledTypes={[]} />);
    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getAllByText('Coming Soon')).toHaveLength(2);
  });
});