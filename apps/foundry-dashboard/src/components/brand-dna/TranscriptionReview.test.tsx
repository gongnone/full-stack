import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TranscriptionReview } from './TranscriptionReview';

describe('TranscriptionReview', () => {
  const mockProps = {
    transcript: 'This is a test transcript.',
    entities: {
      bannedWords: ['bad'],
      voiceMarkers: ['good'],
      stances: [{ topic: 'AI', position: 'Optimistic' }],
    },
    dnaScoreBefore: 50,
    dnaScoreAfter: 75,
  };

  it('renders processing state', () => {
    render(<TranscriptionReview {...mockProps} isProcessing={true} />);
    expect(screen.getByText(/Processing your voice note/i)).toBeInTheDocument();
  });

  it('renders improvement banner when score increases', () => {
    render(<TranscriptionReview {...mockProps} />);
    expect(screen.getByText('Brand DNA Updated')).toBeInTheDocument();
    expect(screen.getByText('+25%')).toBeInTheDocument();
  });

  it('renders transcription text', () => {
    render(<TranscriptionReview {...mockProps} />);
    expect(screen.getByText('This is a test transcript.')).toBeInTheDocument();
  });

  it('renders extracted entities', () => {
    render(<TranscriptionReview {...mockProps} />);
    
    // Voice Markers
    expect(screen.getByText('Voice Markers')).toBeInTheDocument();
    expect(screen.getByText('good')).toBeInTheDocument();
    
    // Banned Words
    expect(screen.getByText('Banned Words')).toBeInTheDocument();
    expect(screen.getByText('bad')).toBeInTheDocument();
    
    // Stances
    expect(screen.getByText('Brand Stances')).toBeInTheDocument();
    expect(screen.getByText('AI:')).toBeInTheDocument();
    expect(screen.getByText('Optimistic')).toBeInTheDocument();
  });

  it('handles empty entities gracefully', () => {
    const emptyProps = {
      ...mockProps,
      entities: { bannedWords: [], voiceMarkers: [], stances: [] },
    };
    render(<TranscriptionReview {...emptyProps} />);
    
    expect(screen.getByText('No markers detected')).toBeInTheDocument();
    expect(screen.getByText('No banned words detected')).toBeInTheDocument();
    expect(screen.getByText('No stances detected')).toBeInTheDocument();
  });
});
