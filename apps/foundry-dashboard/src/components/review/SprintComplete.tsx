import { useState, useEffect } from 'react';
import { ActionButton } from '@/components/ui';

interface SprintStats {
  total: number;
  approved: number;
  killed: number;
  edited: number;
  avgDecisionMs: number;
}

interface SprintCompleteProps {
  stats: SprintStats;
  filter: string;
  onBackToDashboard: () => void;
  onReviewConflicts: () => void;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayed}{suffix}</span>;
}

export function SprintComplete({ stats, filter, onBackToDashboard, onReviewConflicts }: SprintCompleteProps) {
  const hoursSaved = (stats.total * 6) / 60; // 6 minutes per item
  const dollarValue = Math.round(hoursSaved * 200); // $200/hr
  const zeroEditRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const killRate = stats.total > 0 ? Math.round((stats.killed / stats.total) * 100) : 0;

  const copyShareSummary = () => {
    const summary = `Sprint Complete!
Reviewed: ${stats.total} items
Approved: ${stats.approved} (${approvalRate}%)
Killed: ${stats.killed} (${killRate}%)
Time Saved: ${hoursSaved.toFixed(1)} hours ($${dollarValue})
Zero-Edit Rate: ${zeroEditRate}%`;
    navigator.clipboard.writeText(summary);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Celebration */}
      <div className="text-center py-8">
        <div className="w-[72px] h-[72px] mx-auto rounded-full bg-[var(--approve-glow)] flex items-center justify-center mb-6 animate-pulse">
          <svg className="w-10 h-10 text-[var(--approve)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] mb-4">
          Sprint Complete!
        </h1>

        {/* Hero Stat */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 mb-8">
          <div className="text-5xl font-bold text-[var(--approve)] mb-2">
            <AnimatedNumber value={parseFloat(hoursSaved.toFixed(1))} suffix=" hours" />
          </div>
          <div className="text-xl text-[var(--text-secondary)]">saved</div>
          <div className="text-lg text-[var(--approve)] mt-2">
            (${dollarValue} at $200/hr)
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[var(--bg-surface)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
            <div className="text-sm text-[var(--text-secondary)]">Reviewed</div>
          </div>
          <div className="text-center p-4 bg-[var(--bg-surface)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--approve)]">{stats.approved}</div>
            <div className="text-sm text-[var(--text-secondary)]">Approved ({approvalRate}%)</div>
          </div>
          <div className="text-center p-4 bg-[var(--bg-surface)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--kill)]">{stats.killed}</div>
            <div className="text-sm text-[var(--text-secondary)]">Killed ({killRate}%)</div>
          </div>
          <div className="text-center p-4 bg-[var(--bg-surface)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--edit)]">{stats.avgDecisionMs}ms</div>
            <div className="text-sm text-[var(--text-secondary)]">Avg Decision</div>
          </div>
        </div>
      </div>

      {/* Zero-Edit Rate */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Zero-Edit Rate</h2>
          <span className="text-sm text-[var(--text-secondary)]">Target: 60%</span>
        </div>
        <div className="relative h-4 bg-[var(--bg-surface)] rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
              zeroEditRate >= 60 ? 'bg-[var(--approve)]' : 'bg-[var(--warning)]'
            }`}
            style={{ width: `${Math.min(zeroEditRate, 100)}%` }}
          />
          {/* Target marker */}
          <div className="absolute left-[60%] top-0 h-full w-0.5 bg-[var(--text-muted)]" />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={`font-bold ${zeroEditRate >= 60 ? 'text-[var(--approve)]' : 'text-[var(--warning)]'}`}>
            {zeroEditRate}%
          </span>
          <span className="text-[var(--text-muted)]">
            {zeroEditRate >= 60 ? 'Above target' : 'Below target'}
          </span>
        </div>
      </div>

      {/* Post-Sprint Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <ActionButton variant="approve" onClick={onBackToDashboard}>
          Back to Dashboard
        </ActionButton>
        <ActionButton variant="ghost" onClick={onReviewConflicts}>
          Review Conflicts
        </ActionButton>
        <ActionButton variant="outline" onClick={copyShareSummary}>
          Share Summary
        </ActionButton>
      </div>
    </div>
  );
}
