import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignaturePhrasesChips } from './SignaturePhrasesChips';

describe('SignaturePhrasesChips', () => {
  it('renders detected phrases', () => {
    const phrases = [
      { phrase: 'Game changer', example: 'This is a game changer.' },
      { phrase: 'Deep dive', example: 'Let\'s take a deep dive.' },
    ];
    
    render(<SignaturePhrasesChips phrases={phrases} />);
    
    expect(screen.getByText('"Game changer"')).toBeInTheDocument();
    expect(screen.getByText('"Deep dive"')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<SignaturePhrasesChips phrases={[]} />);
    expect(screen.getByText(/No signature phrases detected yet/)).toBeInTheDocument();
  });

  it('shows tooltip with example', () => {
    const phrases = [{ phrase: 'Test', example: 'Example usage' }];
    render(<SignaturePhrasesChips phrases={phrases} />);
    
    const chip = screen.getByText('"Test"');
    expect(chip).toHaveAttribute('title', 'Example usage');
  });
});