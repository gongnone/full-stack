import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentCard } from './ContentCard';
import { Spoke } from '@repo/foundry-core';

const mockSpoke: Spoke = {
  id: 'spoke-1',
  content: 'Test content for the spoke. It should be long enough to preview.',
  platform: 'twitter',
  createdAt: new Date().toISOString(),
  qualityScores: {
    g2_hook: 85,
    g7_engagement: 92,
    g6_visual: 78,
  },
  visualArchetype: 'Minimalist',
  thumbnailConcept: 'Abstract shapes with text',
  imagePrompt: 'A futuristic workspace with AI holograms',
} as any;

describe('ContentCard', () => {
  it('renders content and basic info', () => {
    render(<ContentCard spoke={mockSpoke} />);
    expect(screen.getByText(mockSpoke.content)).toBeInTheDocument();
    expect(screen.getByText('twitter')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  it('renders visual concept section when present', () => {
    render(<ContentCard spoke={mockSpoke} />);
    expect(screen.getByText('Visual Concept Engine')).toBeInTheDocument();
    expect(screen.getByText('Minimalist')).toBeInTheDocument();
    expect(screen.getByText('Abstract shapes with text')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockSpoke.imagePrompt as string))).toBeInTheDocument();
  });

  it('calls onApprove when approve button is clicked', () => {
    const onApprove = vi.fn();
    render(<ContentCard spoke={mockSpoke} onApprove={onApprove} />);
    
    // Find button with class or variant. ActionButton uses variant prop.
    // We can find by icon or hint since ActionButton doesn't have text.
    // Approve is on the right, linked to '→' hint.
    const buttons = screen.getAllByRole('button');
    // Usually: [Kill, Edit, Approve]
    fireEvent.click(buttons[2]); 
    expect(onApprove).toHaveBeenCalled();
  });

  it('calls onKill when kill button is clicked', () => {
    const onKill = vi.fn();
    render(<ContentCard spoke={mockSpoke} onKill={onKill} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); 
    expect(onKill).toHaveBeenCalled();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ContentCard spoke={mockSpoke} onEdit={onEdit} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); 
    expect(onEdit).toHaveBeenCalled();
  });

  it('applies active styles when isActive is true', () => {
    const { container } = render(<ContentCard spoke={mockSpoke} isActive={true} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('ring-2');
    expect(card.className).toContain('ring-blue-500');
  });
});
