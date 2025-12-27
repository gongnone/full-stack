import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrandDNACard } from './BrandDNACard';
import type { BrandDNAReport } from '@/../../worker/types';

// Mock child components
vi.mock('./VoiceMetricsProgress', () => ({
  VoiceMetricsProgress: () => <div data-testid="voice-metrics-progress" />,
}));
vi.mock('./SignaturePhrasesChips', () => ({
  SignaturePhrasesChips: () => <div data-testid="signature-phrases-chips" />,
}));
vi.mock('./TopicsToAvoid', () => ({
  TopicsToAvoid: () => <div data-testid="topics-to-avoid" />,
}));
vi.mock('./RecommendationsSection', () => ({
  RecommendationsSection: () => <div data-testid="recommendations-section" />,
}));

const mockReport = {
  strengthScore: 85,
  status: 'good',
  sampleCount: 150,
  primaryTone: 'Professional',
  writingStyle: 'Concise',
  targetAudience: 'Executives',
  signaturePhrases: [{ phrase: 'Leverage', example: 'Leverage our skills' }, { phrase: 'Synergy', example: 'Create synergy' }],
  topicsToAvoid: ['Cheap', 'Discount'],
  breakdown: {
    tone_match: 80,
    style_consistency: 85,
    vocabulary_alignment: 90,
  },
  recommendations: [{ type: 'add_samples', message: 'Add more samples' }],
  lastCalibration: {
    timestamp: 1672531200, // 2023-01-01
    source: 'manual',
  },
} as any;

describe('BrandDNACard', () => {
  it('renders strength score and status badge', () => {
    render(<BrandDNACard report={mockReport} />);
    expect(screen.getByTestId('dna-strength-score')).toHaveTextContent('85%');
    expect(screen.getByTestId('status-badge-good')).toHaveTextContent('Good');
    expect(screen.getByText(/150 training samples/)).toBeInTheDocument();
  });

  it('renders voice profile grid', () => {
    render(<BrandDNACard report={mockReport} />);
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Concise')).toBeInTheDocument();
    expect(screen.getByText('Executives')).toBeInTheDocument();
  });

  it('renders child components', () => {
    render(<BrandDNACard report={mockReport} />);
    expect(screen.getByTestId('voice-metrics-progress')).toBeInTheDocument();
    expect(screen.getByTestId('signature-phrases-chips')).toBeInTheDocument();
    expect(screen.getByTestId('topics-to-avoid')).toBeInTheDocument();
    expect(screen.getByTestId('recommendations-section')).toBeInTheDocument();
  });

  it('renders Edit Voice Profile button when callback provided', () => {
    const onEdit = vi.fn();
    render(<BrandDNACard report={mockReport} onEditVoiceProfile={onEdit} />);
    
    const btn = screen.getByTestId('edit-voice-profile-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalled();
  });

  it('hides Edit Voice Profile button when no callback provided', () => {
    render(<BrandDNACard report={mockReport} />);
    expect(screen.queryByTestId('edit-voice-profile-btn')).not.toBeInTheDocument();
  });

  it('handles missing voice profile data gracefully', () => {
    const emptyReport = {
      ...mockReport,
      primaryTone: undefined,
      writingStyle: undefined,
      targetAudience: undefined,
    };
    // @ts-ignore
    render(<BrandDNACard report={emptyReport} />);
    
    const notDetected = screen.getAllByText('Not detected');
    expect(notDetected).toHaveLength(3);
  });
});
