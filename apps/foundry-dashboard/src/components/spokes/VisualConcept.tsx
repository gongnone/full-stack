/**
 * Story 4.5: Multimodal Visual Concept Engine
 * Display visual concepts and mockups for platform-specific spokes
 */

import { useState } from 'react';
import { ActionButton } from '@/components/ui';
import type { SpokePlatform } from '../../../worker/types';

export interface VisualConceptProps {
  spokeId: string;
  platform: SpokePlatform;
  content: string;
  visualUrl?: string;
  imagePrompt?: string;
  layoutSuggestion?: LayoutSuggestion;
  onGenerateVisual?: () => void;
  onApproveVisual?: () => void;
  onRegenerateVisual?: () => void;
}

export interface LayoutSuggestion {
  type: 'carousel' | 'thread' | 'video' | 'image-caption' | 'infographic';
  slides?: SlideLayout[];
  aspectRatio?: string;
  colorScheme?: string[];
  typography?: string;
  visualElements?: string[];
}

export interface SlideLayout {
  number: number;
  heading: string;
  body: string;
  visualType: 'chart' | 'icon' | 'photo' | 'illustration' | 'text';
  notes?: string;
}

const PLATFORM_VISUAL_TYPES: Record<
  SpokePlatform,
  { type: string; description: string; icon: string }
> = {
  twitter: {
    type: 'Image Card',
    description: 'Square or 16:9 image with overlaid text',
    icon: '🖼',
  },
  linkedin: {
    type: 'Professional Graphic',
    description: 'Clean, data-driven visualization',
    icon: '📊',
  },
  tiktok: {
    type: 'Video Storyboard',
    description: 'Vertical video with text overlays',
    icon: '🎬',
  },
  instagram: {
    type: 'Feed Post',
    description: 'Square visual with aesthetic appeal',
    icon: '📸',
  },
  newsletter: {
    type: 'Header Image',
    description: 'Wide banner for email header',
    icon: '✉️',
  },
  thread: {
    type: 'Thread Graphics',
    description: 'Consistent design across 5-7 cards',
    icon: '🧵',
  },
  carousel: {
    type: 'Slide Deck',
    description: 'Educational slide sequence',
    icon: '📑',
  },
};

export function VisualConcept({
  spokeId,
  platform,
  content,
  visualUrl,
  imagePrompt,
  layoutSuggestion,
  onGenerateVisual,
  onApproveVisual,
  onRegenerateVisual,
}: VisualConceptProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const platformVisual = PLATFORM_VISUAL_TYPES[platform];

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    onGenerateVisual?.();
  };

  // Default layout if none provided
  const defaultLayout: LayoutSuggestion = {
    type: platform === 'carousel' || platform === 'thread' ? 'carousel' : 'image-caption',
    aspectRatio: platform === 'tiktok' ? '9:16' : platform === 'instagram' ? '1:1' : '16:9',
    colorScheme: ['#1D9BF0', '#FFFFFF', '#000000'],
    typography: 'Modern Sans-Serif',
    visualElements: ['Icon', 'Gradient Background', 'Bold Typography'],
    slides:
      platform === 'carousel' || platform === 'thread'
        ? [
            {
              number: 1,
              heading: 'Hook Slide',
              body: 'Grab attention with bold statement',
              visualType: 'text',
              notes: 'Large text, minimal design',
            },
            {
              number: 2,
              heading: 'Problem',
              body: 'Identify the pain point',
              visualType: 'icon',
              notes: 'Problem icon or illustration',
            },
            {
              number: 3,
              heading: 'Solution',
              body: 'Present your framework',
              visualType: 'chart',
              notes: 'Data or process visualization',
            },
            {
              number: 4,
              heading: 'Benefits',
              body: 'Show transformation',
              visualType: 'illustration',
              notes: 'Before/after visual',
            },
            {
              number: 5,
              heading: 'Call to Action',
              body: 'Next step for audience',
              visualType: 'text',
              notes: 'Strong CTA with link',
            },
          ]
        : undefined,
  };

  const layout = layoutSuggestion || defaultLayout;

  return (
    <div
      className="rounded-lg p-6 space-y-6"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span>{platformVisual.icon}</span>
            <span>Visual Concept</span>
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {platformVisual.type} for {platform}
          </p>
        </div>
        {!visualUrl && !isGenerating && (
          <ActionButton variant="approve" onClick={handleGenerate} size="sm">
            Generate Visual
          </ActionButton>
        )}
      </div>

      {/* Platform Info */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl">{platformVisual.icon}</div>
          <div>
            <h4 className="font-semibold text-sm text-[var(--text-primary)]">
              {platformVisual.type}
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {platformVisual.description}
            </p>
          </div>
        </div>
      </div>

      {/* Layout Specifications */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">
          Layout Specifications
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="text-xs text-[var(--text-muted)] mb-1">Aspect Ratio</div>
            <div className="font-medium text-sm text-[var(--text-primary)]">
              {layout.aspectRatio}
            </div>
          </div>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="text-xs text-[var(--text-muted)] mb-1">Layout Type</div>
            <div className="font-medium text-sm text-[var(--text-primary)] capitalize">
              {layout.type}
            </div>
          </div>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="text-xs text-[var(--text-muted)] mb-1">Typography</div>
            <div className="font-medium text-sm text-[var(--text-primary)]">
              {layout.typography}
            </div>
          </div>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="text-xs text-[var(--text-muted)] mb-1">Color Scheme</div>
            <div className="flex gap-1 mt-1">
              {layout.colorScheme?.map((color, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded border border-[var(--border-subtle)]"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Visual Elements */}
        {layout.visualElements && layout.visualElements.length > 0 && (
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="text-xs text-[var(--text-muted)] mb-2">Visual Elements</div>
            <div className="flex flex-wrap gap-2">
              {layout.visualElements.map((element, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {element}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide Breakdown (for carousel/thread) */}
      {layout.slides && layout.slides.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
            Slide Breakdown ({layout.slides.length} slides)
          </h4>

          {/* Slide Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {layout.slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  activeSlide === idx
                    ? 'bg-[#1D9BF0] text-white'
                    : 'bg-[var(--bg-base)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                Slide {slide.number}
              </button>
            ))}
          </div>

          {/* Active Slide Details */}
          {layout.slides && layout.slides[activeSlide] && (
            <div
              className="p-4 rounded-lg space-y-3"
              style={{
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <h5 className="font-semibold text-sm text-[var(--text-primary)]">
                  Slide {layout.slides[activeSlide].number}:{' '}
                  {layout.slides[activeSlide].heading}
                </h5>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {layout.slides[activeSlide].visualType}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {layout.slides[activeSlide].body}
              </p>
              {layout.slides[activeSlide].notes && (
                <div
                  className="p-2 rounded text-xs italic"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-muted)',
                  }}
                >
                  💡 {layout.slides[activeSlide].notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image Prompt (for AI generation) */}
      {imagePrompt && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
            AI Image Prompt
          </h4>
          <div
            className="p-3 rounded-lg text-sm font-mono"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {imagePrompt}
          </div>
        </div>
      )}

      {/* Visual Preview */}
      {isGenerating ? (
        <div
          className="aspect-video rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bg-base)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <div className="text-center space-y-3">
            <svg
              className="w-12 h-12 mx-auto animate-spin text-[#1D9BF0]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-[var(--text-muted)]">
              Generating visual concept...
            </p>
          </div>
        </div>
      ) : visualUrl ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
            Visual Preview
          </h4>
          <div className="rounded-lg overflow-hidden border border-[var(--border-subtle)]">
            <img
              src={visualUrl}
              alt="Visual concept preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      ) : (
        <div
          className="aspect-video rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bg-base)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <div className="text-center space-y-2">
            <div className="text-4xl">{platformVisual.icon}</div>
            <p className="text-sm text-[var(--text-muted)]">
              No visual generated yet
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {visualUrl && (
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
          {onRegenerateVisual && (
            <ActionButton variant="ghost" onClick={onRegenerateVisual} size="sm">
              Regenerate
            </ActionButton>
          )}
          {onApproveVisual && (
            <ActionButton variant="approve" onClick={onApproveVisual} size="sm">
              Approve Visual
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}
