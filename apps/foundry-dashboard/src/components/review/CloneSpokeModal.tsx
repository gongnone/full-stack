import { useState } from 'react';
import { ActionButton } from '@/components/ui';

interface CloneSpokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: CloneOptions) => void;
  spokeContent: string;
  spokeScore: number;
  isLoading?: boolean;
}

interface CloneOptions {
  variationCount: number;
  platforms: string[];
  varyAngle: boolean;
}

const platforms = [
  { id: 'linkedin', label: 'LinkedIn', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
  )},
  { id: 'twitter', label: 'X / Twitter', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
  )},
  { id: 'threads', label: 'Threads', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.85-.706 2.024-1.128 3.394-1.226 1.168-.083 2.246.016 3.212.296-.037-1.022-.248-1.805-.648-2.396-.49-.725-1.232-1.098-2.204-1.108-.744.009-1.374.2-1.873.567-.477.351-.8.831-.96 1.428l-1.945-.493c.267-1.011.821-1.853 1.648-2.503.9-.707 2.032-1.073 3.367-1.087 1.588.019 2.823.608 3.672 1.752.755 1.018 1.126 2.378 1.104 4.044v.159c.033.5.024.997-.028 1.486 1.075.681 1.9 1.6 2.388 2.727.72 1.665.766 4.408-1.37 6.502-1.79 1.756-4.097 2.56-7.263 2.582zm-2.896-7.478c-.784.056-1.416.248-1.83.557-.47.35-.67.778-.648 1.31.036.65.36 1.15.967 1.487.661.367 1.49.54 2.396.496 1.076-.058 1.906-.466 2.468-1.213.46-.612.77-1.414.923-2.39-.93-.254-1.98-.368-3.076-.296l-.2.05z"/></svg>
  )},
];

export function CloneSpokeModal({
  isOpen,
  onClose,
  onConfirm,
  spokeContent,
  spokeScore,
  isLoading,
}: CloneSpokeModalProps) {
  const [variationCount, setVariationCount] = useState(3);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [varyAngle, setVaryAngle] = useState(false);

  if (!isOpen) return null;

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      variationCount,
      platforms: selectedPlatforms,
      varyAngle,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Clone Best</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--approve-glow)] rounded-full">
            <span className="text-sm font-medium text-[var(--approve)]">G7: {spokeScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Original Content Preview */}
        <div className="bg-[var(--bg-surface)] rounded-xl p-4 mb-6 border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Original Spoke</p>
          <p className="text-sm text-[var(--text-primary)] line-clamp-3">{spokeContent}</p>
        </div>

        {/* Variation Count */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Number of Variations
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setVariationCount(num)}
                className={`
                  w-12 h-12 rounded-lg font-semibold transition-all
                  ${variationCount === num
                    ? 'bg-[var(--edit)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Target Platforms */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Target Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${selectedPlatforms.includes(platform.id)
                    ? 'bg-[var(--edit)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                {platform.icon}
                <span className="text-sm font-medium">{platform.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vary Angle */}
        <div className="mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={varyAngle}
              onChange={(e) => setVaryAngle(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] checked:bg-[var(--edit)] checked:border-[var(--edit)]"
            />
            <div>
              <span className="text-sm font-medium text-[var(--text-primary)]">Vary Psychological Angle</span>
              <p className="text-xs text-[var(--text-secondary)]">Generate slight variations in hook and angle</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <ActionButton
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="approve"
            className="flex-1"
            onClick={handleConfirm}
            disabled={isLoading || selectedPlatforms.length === 0}
          >
            {isLoading ? 'Generating...' : `Clone ${variationCount} Variation${variationCount > 1 ? 's' : ''}`}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
