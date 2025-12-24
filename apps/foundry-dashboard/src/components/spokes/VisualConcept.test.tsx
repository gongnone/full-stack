/**
 * Story 4.5: Multimodal Visual Concept Engine - E2E Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VisualConcept, type LayoutSuggestion } from './VisualConcept';

describe('VisualConcept', () => {
  const mockSpokeId = 'spoke-123';
  const mockContent = 'Test spoke content for visual generation';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders component with title', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Visual Concept')).toBeInTheDocument();
    });

    it('displays platform-specific visual type', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Image Card for twitter')).toBeInTheDocument();
    });

    it('shows Generate Visual button when no visual exists', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="linkedin"
          content={mockContent}
        />
      );
      expect(screen.getByRole('button', { name: /Generate Visual/i })).toBeInTheDocument();
    });
  });

  describe('Platform Visual Types', () => {
    it('shows correct type for Twitter', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Image Card')).toBeInTheDocument();
    });

    it('shows correct type for LinkedIn', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="linkedin"
          content={mockContent}
        />
      );
      expect(screen.getByText('Professional Graphic')).toBeInTheDocument();
    });

    it('shows correct type for TikTok', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="tiktok"
          content={mockContent}
        />
      );
      expect(screen.getByText('Video Storyboard')).toBeInTheDocument();
    });

    it('shows correct type for Instagram', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="instagram"
          content={mockContent}
        />
      );
      expect(screen.getByText('Feed Post')).toBeInTheDocument();
    });

    it('shows correct type for carousel', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );
      expect(screen.getByText('Slide Deck')).toBeInTheDocument();
    });
  });

  describe('Layout Specifications', () => {
    it('displays aspect ratio', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Aspect Ratio')).toBeInTheDocument();
      expect(screen.getByText('16:9')).toBeInTheDocument();
    });

    it('displays layout type', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Layout Type')).toBeInTheDocument();
    });

    it('displays typography specification', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Typography')).toBeInTheDocument();
      expect(screen.getByText('Modern Sans-Serif')).toBeInTheDocument();
    });

    it('displays color scheme swatches', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Color Scheme')).toBeInTheDocument();
      // Color swatches should be rendered
      const colorSwatches = screen.getByText('Color Scheme').parentElement?.querySelectorAll('div[style*="backgroundColor"]');
      expect(colorSwatches).toBeTruthy();
    });

    it('uses 9:16 aspect ratio for TikTok', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="tiktok"
          content={mockContent}
        />
      );
      expect(screen.getByText('9:16')).toBeInTheDocument();
    });

    it('uses 1:1 aspect ratio for Instagram', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="instagram"
          content={mockContent}
        />
      );
      expect(screen.getByText('1:1')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('displays visual elements list', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Visual Elements')).toBeInTheDocument();
    });

    it('shows individual visual element badges', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Gradient Background')).toBeInTheDocument();
      expect(screen.getByText('Bold Typography')).toBeInTheDocument();
    });
  });

  describe('Slide Breakdown (Carousel/Thread)', () => {
    it('shows slide breakdown for carousel platform', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );
      expect(screen.getByText(/Slide Breakdown \(5 slides\)/i)).toBeInTheDocument();
    });

    it('shows slide breakdown for thread platform', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="thread"
          content={mockContent}
        />
      );
      expect(screen.getByText(/Slide Breakdown \(5 slides\)/i)).toBeInTheDocument();
    });

    it('does not show slide breakdown for single image platforms', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.queryByText(/Slide Breakdown/i)).not.toBeInTheDocument();
    });

    it('renders slide navigation buttons', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );
      expect(screen.getByRole('button', { name: /Slide 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Slide 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Slide 3/i })).toBeInTheDocument();
    });

    it('switches active slide when navigation clicked', async () => {
      const user = userEvent.setup();
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );

      const slide2Button = screen.getByRole('button', { name: /Slide 2/i });
      await user.click(slide2Button);

      expect(screen.getByText(/Problem/i)).toBeInTheDocument();
    });

    it('displays slide details for active slide', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );
      expect(screen.getByText(/Hook Slide/i)).toBeInTheDocument();
      expect(screen.getByText(/Grab attention with bold statement/i)).toBeInTheDocument();
    });

    it('shows visual type badge for each slide', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('displays slide notes when available', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );
      expect(screen.getByText(/Large text, minimal design/i)).toBeInTheDocument();
    });
  });

  describe('Image Prompt', () => {
    it('displays AI image prompt when provided', () => {
      const mockPrompt = 'A modern minimalist design with bold typography and gradient background';
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          imagePrompt={mockPrompt}
        />
      );
      expect(screen.getByText('AI Image Prompt')).toBeInTheDocument();
      expect(screen.getByText(mockPrompt)).toBeInTheDocument();
    });

    it('does not show prompt section when not provided', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.queryByText('AI Image Prompt')).not.toBeInTheDocument();
    });
  });

  describe('Visual Preview', () => {
    it('shows placeholder when no visual generated', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByText('No visual generated yet')).toBeInTheDocument();
    });

    it('shows loading state during generation', async () => {
      const user = userEvent.setup();
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          onGenerateVisual={vi.fn()}
        />
      );

      await user.click(screen.getByRole('button', { name: /Generate Visual/i }));

      await waitFor(() => {
        expect(screen.getByText('Generating visual concept...')).toBeInTheDocument();
      });
    });

    it('displays visual preview when URL provided', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          visualUrl="https://example.com/visual.png"
        />
      );
      expect(screen.getByText('Visual Preview')).toBeInTheDocument();
      const img = screen.getByAltText('Visual concept preview');
      expect(img).toHaveAttribute('src', 'https://example.com/visual.png');
    });

    it('does not show Generate button when visual exists', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          visualUrl="https://example.com/visual.png"
        />
      );
      expect(screen.queryByRole('button', { name: /Generate Visual/i })).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('calls onGenerateVisual when Generate button clicked', async () => {
      const user = userEvent.setup();
      const handleGenerate = vi.fn();
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          onGenerateVisual={handleGenerate}
        />
      );

      await user.click(screen.getByRole('button', { name: /Generate Visual/i }));

      await waitFor(() => {
        expect(handleGenerate).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    it('shows action buttons when visual exists', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          visualUrl="https://example.com/visual.png"
          onApproveVisual={vi.fn()}
          onRegenerateVisual={vi.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /Regenerate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Approve Visual/i })).toBeInTheDocument();
    });

    it('calls onApproveVisual when Approve button clicked', async () => {
      const user = userEvent.setup();
      const handleApprove = vi.fn();
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          visualUrl="https://example.com/visual.png"
          onApproveVisual={handleApprove}
        />
      );

      await user.click(screen.getByRole('button', { name: /Approve Visual/i }));
      expect(handleApprove).toHaveBeenCalledTimes(1);
    });

    it('calls onRegenerateVisual when Regenerate button clicked', async () => {
      const user = userEvent.setup();
      const handleRegenerate = vi.fn();
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          visualUrl="https://example.com/visual.png"
          onRegenerateVisual={handleRegenerate}
        />
      );

      await user.click(screen.getByRole('button', { name: /Regenerate/i }));
      expect(handleRegenerate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Layout Suggestions', () => {
    it('uses custom layout when provided', () => {
      const customLayout: LayoutSuggestion = {
        type: 'infographic',
        aspectRatio: '4:5',
        colorScheme: ['#FF0000', '#00FF00'],
        typography: 'Custom Font',
        visualElements: ['Custom Element 1', 'Custom Element 2'],
      };

      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          layoutSuggestion={customLayout}
        />
      );

      expect(screen.getByText('4:5')).toBeInTheDocument();
      expect(screen.getByText('Custom Font')).toBeInTheDocument();
      expect(screen.getByText('Custom Element 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Element 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
        />
      );
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Visual Concept');
    });

    it('buttons are keyboard accessible', async () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          onGenerateVisual={vi.fn()}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Visual/i });
      generateButton.focus();
      expect(generateButton).toHaveFocus();
    });

    it('slide navigation is keyboard accessible', async () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="carousel"
          content={mockContent}
        />
      );

      const slide2Button = screen.getByRole('button', { name: /Slide 2/i });
      slide2Button.focus();
      expect(slide2Button).toHaveFocus();
    });

    it('image has alt text', () => {
      render(
        <VisualConcept
          spokeId={mockSpokeId}
          platform="twitter"
          content={mockContent}
          visualUrl="https://example.com/visual.png"
        />
      );
      const img = screen.getByAltText('Visual concept preview');
      expect(img).toBeInTheDocument();
    });
  });
});
