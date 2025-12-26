import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SampleStats } from './SampleStats';

describe('SampleStats', () => {
  const mockProps = {
    totalSamples: 5,
    totalWords: 1500,
    averageQuality: 85,
    analyzedCount: 4,
    pendingCount: 1,
    processingCount: 0,
    failedCount: 0,
    recommendation: 'Good start',
  };

  it('renders loading state', () => {
    const { container } = render(<SampleStats {...mockProps} isLoading={true} />);
    expect(container.getElementsByClassName('animate-pulse')).toHaveLength(4);
  });

  it('renders stats correctly', () => {
    render(<SampleStats {...mockProps} />);
    
    expect(screen.getByText('5')).toBeInTheDocument(); // Samples
    expect(screen.getByText('1.5K')).toBeInTheDocument(); // Words
    expect(screen.getByText('85%')).toBeInTheDocument(); // Quality
  });

  it('renders processing status', () => {
    render(<SampleStats {...mockProps} />);
    expect(screen.getByText('1 pending')).toBeInTheDocument();
  });

  it('renders recommendation', () => {
    render(<SampleStats {...mockProps} />);
    expect(screen.getByText('Good start')).toBeInTheDocument();
  });

  it('calculates low strength correctly', () => {
    render(<SampleStats {...mockProps} totalSamples={1} averageQuality={null} />);
    // 1 sample * 10 = 10%
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText(/Getting Started/)).toBeInTheDocument();
  });
});