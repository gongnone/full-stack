import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoiceMetricsProgress } from './VoiceMetricsProgress';

describe('VoiceMetricsProgress', () => {
  const mockBreakdown = {
    tone_match: 85,
    vocabulary: 70,
    structure: 60,
    topics: 40,
  };

  it('renders all metrics', () => {
    render(<VoiceMetricsProgress breakdown={mockBreakdown} />);
    
    expect(screen.getByText('Tone Match')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    expect(screen.getByText('Vocabulary')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    
    expect(screen.getByText('Structure')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});