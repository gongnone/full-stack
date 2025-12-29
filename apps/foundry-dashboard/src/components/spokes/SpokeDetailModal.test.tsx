import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpokeDetailModal } from './SpokeDetailModal';
import type { Spoke } from '@worker/types';

const MOCK_SPOKE: Spoke = {
  id: 'spoke-1',
  hubId: 'hub-1',
  pillarId: 'pillar-1',
  platform: 'twitter',
  status: 'ready',
  content: 'This is a test tweet',
  psychological_angle: 'Contrarian',
  g2_score: 85,
  g4_status: 'pass',
  g5_status: 'pass',
  quality_scores: {
    g7_overall: 90
  },
  created_at: Date.now(),
  updated_at: Date.now(),
  generation_attempt: 1,
  metadata: {}
};

describe('SpokeDetailModal', () => {
  it('renders nothing when spoke is null', () => {
    const { container } = render(
      <SpokeDetailModal
        spoke={null}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders spoke details when open', () => {
    render(
      <SpokeDetailModal
        spoke={MOCK_SPOKE}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText('This is a test tweet')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Contrarian')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument(); // G2 Score
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(
      <SpokeDetailModal
        spoke={MOCK_SPOKE}
        isOpen={true}
        onClose={handleClose}
        onNavigate={vi.fn()}
      />
    );

    // Radix Dialog close button is typically an X icon
    // We can find it by its accessibility label if added, or by role
    // Since our component wraps the SVG in a button, we can look for button
    const buttons = screen.getAllByRole('button');
    // The close button is usually the first one or distinct. 
    // In our implementation it's inside Dialog.Close
    fireEvent.click(buttons[0]); 
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onNavigate when arrow buttons clicked', () => {
    const handleNavigate = vi.fn();
    render(
      <SpokeDetailModal
        spoke={MOCK_SPOKE}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={handleNavigate}
        hasNext={true}
        hasPrev={true}
      />
    );

    const prevButton = screen.getByTitle('Previous (Arrow Left)');
    const nextButton = screen.getByTitle('Next (Arrow Right)');

    fireEvent.click(prevButton);
    expect(handleNavigate).toHaveBeenCalledWith('prev');

    fireEvent.click(nextButton);
    expect(handleNavigate).toHaveBeenCalledWith('next');
  });

  it('calls action callbacks when buttons clicked', () => {
    const handleApprove = vi.fn();
    const handleEdit = vi.fn();
    const handleReject = vi.fn();

    render(
      <SpokeDetailModal
        spoke={MOCK_SPOKE}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
        onApprove={handleApprove}
        onEdit={handleEdit}
        onReject={handleReject}
      />
    );

    fireEvent.click(screen.getByText('Approve'));
    expect(handleApprove).toHaveBeenCalledWith('spoke-1');

    fireEvent.click(screen.getByText('Edit'));
    expect(handleEdit).toHaveBeenCalledWith('spoke-1');

    fireEvent.click(screen.getByText('Reject'));
    expect(handleReject).toHaveBeenCalledWith('spoke-1');
  });

  it('handles keyboard navigation', () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();

    render(
      <SpokeDetailModal
        spoke={MOCK_SPOKE}
        isOpen={true}
        onClose={handleClose}
        onNavigate={handleNavigate}
        hasNext={true}
        hasPrev={true}
      />
    );

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(handleNavigate).toHaveBeenCalledWith('next');

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(handleNavigate).toHaveBeenCalledWith('prev');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});
