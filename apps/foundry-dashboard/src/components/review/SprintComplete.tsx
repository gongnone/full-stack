import { useState, useEffect } from 'react';
import { ActionButton } from '@/components/ui';
import { ROI_CONFIG, QUALITY_GATE_CONFIG, UI_CONFIG } from '@/lib/constants';
import { useToast } from '@/lib/toast';
import { trpc } from '@/lib/trpc-client';
import { TestimonialRequestModal } from '@/components/testimonials/TestimonialRequestModal';

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
  clientId: string;
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

export function SprintComplete({ stats, filter: _filter, clientId, onBackToDashboard, onReviewConflicts }: SprintCompleteProps) {
  const { addToast } = useToast();
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [hasCheckedTestimonial, setHasCheckedTestimonial] = useState(false);

  const hoursSaved = (stats.total * ROI_CONFIG.MINUTES_SAVED_PER_SPOKE) / 60;
  const dollarValue = Math.round(hoursSaved * ROI_CONFIG.HOURLY_RATE_USD);
  const zeroEditRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const killRate = stats.total > 0 ? Math.round((stats.killed / stats.total) * 100) : 0;
  const avgTimePerSpoke = Math.round(stats.avgDecisionMs / 1000); // Convert to seconds

  // P0-3: Dynamic celebration message based on approval rate
  const getCelebrationMessage = () => {
    if (approvalRate >= 80) return "🌟 Outstanding! Your content is 🔥";
    if (approvalRate >= 60) return "🎉 Great job! Solid content quality";
    if (approvalRate >= 40) return "👍 Good work! Room for optimization";
    return "🤔 Keep iterating - quality will improve!";
  };

  // P0-3: Speed badge calculation
  const getSpeedBadge = () => {
    if (avgTimePerSpoke < 5) return { label: "⚡️ Lightning Fast", color: "yellow" };
    if (avgTimePerSpoke < 10) return { label: "🚀 Swift Reviewer", color: "blue" };
    if (avgTimePerSpoke < 20) return { label: "🎯 Thorough Reviewer", color: "green" };
    return { label: "🧐 Detail-Oriented", color: "purple" };
  };

  const speedBadge = getSpeedBadge();

  // FR-1.5.16: Check if testimonial should be triggered
  const testimonialTriggerQuery = trpc.testimonials.checkTrigger.useQuery(
    { clientId },
    { enabled: !!clientId && !hasCheckedTestimonial }
  );

  // Show testimonial modal after a short delay when trigger conditions are met
  useEffect(() => {
    if (testimonialTriggerQuery.data?.shouldTrigger && !hasCheckedTestimonial) {
      setHasCheckedTestimonial(true);
      // Delay to let user see celebration first
      const timer = setTimeout(() => {
        setShowTestimonialModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [testimonialTriggerQuery.data, hasCheckedTestimonial]);

  const copyShareSummary = async () => {
    const summary = `Sprint Complete!
Reviewed: ${stats.total} items
Approved: ${stats.approved} (${approvalRate}%)
Killed: ${stats.killed} (${killRate}%)
Time Saved: ${hoursSaved.toFixed(1)} hours ($${dollarValue})
Zero-Edit Rate: ${zeroEditRate}%`;

    try {
      await navigator.clipboard.writeText(summary);
      addToast('Summary copied to clipboard', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    } catch (err) {
      addToast('Failed to copy summary', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* P0-3: Trophy with Confetti Animation */}
      <div className="text-center py-8">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Confetti particles */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-0 left-1/4 w-3 h-3 rounded-full bg-yellow-400 animate-float" />
            <div className="absolute top-1/4 right-0 w-2 h-2 rounded-full bg-blue-400 animate-float delay-100" />
            <div className="absolute bottom-1/4 left-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-float delay-200" />
            <div className="absolute bottom-0 right-1/4 w-3 h-3 rounded-full bg-red-400 animate-float delay-300" />
          </div>

          {/* Trophy icon */}
          <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl animate-bounce-in">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M11 7H13V13H11V7M11 15H13V17H11V15Z" />
            </svg>
          </div>
        </div>

        {/* P0-3: Dynamic Celebration Message */}
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 animate-slide-up">
          {getCelebrationMessage()}
        </h1>
        <p className="text-xl text-[var(--text-secondary)] animate-slide-up delay-100">
          Sprint Complete! 🎊
        </p>
      </div>

      {/* P0-3: Performance Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 animate-slide-up delay-200">
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          speedBadge.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
          speedBadge.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
          speedBadge.color === 'green' ? 'bg-green-500/20 text-green-400' :
          'bg-purple-500/20 text-purple-400'
        }`}>
          {speedBadge.label}
        </div>
        <div className="px-4 py-2 rounded-full bg-[var(--approve-glow)] text-[var(--approve)] text-sm font-semibold">
          {approvalRate}% Approval Rate
        </div>
        <div className="px-4 py-2 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-sm font-semibold">
          ~{avgTimePerSpoke}s per spoke
        </div>
      </div>

      {/* P0-3: Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up delay-300">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--approve)] mb-2">{stats.approved}</div>
          <div className="text-sm text-[var(--text-secondary)]">Approved</div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--edit)] mb-2">{stats.edited}</div>
          <div className="text-sm text-[var(--text-secondary)]">Edited</div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--kill)] mb-2">{stats.killed}</div>
          <div className="text-sm text-[var(--text-secondary)]">Killed</div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-2">{stats.total}</div>
          <div className="text-sm text-[var(--text-secondary)]">Reviewed</div>
        </div>
      </div>

      {/* ROI Metrics */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 text-center animate-slide-up delay-400">
        <div className="text-5xl font-bold text-[var(--approve)] mb-2">
          <AnimatedNumber value={parseFloat(hoursSaved.toFixed(1))} suffix=" hours" />
        </div>
        <div className="text-xl text-[var(--text-secondary)]">saved</div>
        <div className="text-lg text-[var(--approve)] mt-2">
          (${dollarValue} at $${ROI_CONFIG.HOURLY_RATE_USD}/hr)
        </div>
      </div>

      {/* Zero-Edit Rate */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Zero-Edit Rate</h2>
          <span className="text-sm text-[var(--text-secondary)]">Target: {QUALITY_GATE_CONFIG.TARGET_ZERO_EDIT_RATE}%</span>
        </div>
        <div className="relative h-4 bg-[var(--bg-surface)] rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
              zeroEditRate >= QUALITY_GATE_CONFIG.TARGET_ZERO_EDIT_RATE ? 'bg-[var(--approve)]' : 'bg-[var(--warning)]'
            }`}
            style={{ width: `${Math.min(zeroEditRate, 100)}%` }}
          />
          {/* Target marker */}
          <div className="absolute left-[60%] top-0 h-full w-0.5 bg-[var(--text-muted)]" style={{ left: `${QUALITY_GATE_CONFIG.TARGET_ZERO_EDIT_RATE}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={`font-bold ${zeroEditRate >= QUALITY_GATE_CONFIG.TARGET_ZERO_EDIT_RATE ? 'text-[var(--approve)]' : 'text-[var(--warning)]'}`}>
            {zeroEditRate}%
          </span>
          <span className="text-[var(--text-muted)]">
            {zeroEditRate >= QUALITY_GATE_CONFIG.TARGET_ZERO_EDIT_RATE ? 'Above target' : 'Below target'}
          </span>
        </div>
      </div>

      {/* P0-3: What's Next Section */}
      <div className="animate-slide-up delay-500">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">What's Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onBackToDashboard}
            className="p-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded-lg border border-[var(--border-subtle)] transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--approve-glow)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[var(--approve)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Schedule {stats.approved} Approved Posts</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Plan your content calendar</p>
          </button>

          <button
            onClick={onReviewConflicts}
            className="p-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded-lg border border-[var(--border-subtle)] transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--kill-glow)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[var(--kill)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Review Conflicts</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Fix flagged content issues</p>
          </button>

          <button
            onClick={onBackToDashboard}
            className="p-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded-lg border border-[var(--border-subtle)] transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--edit-glow)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[var(--edit)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Generate More Content</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Create a new hub</p>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <ActionButton variant="approve" onClick={onBackToDashboard}>
          Back to Dashboard
        </ActionButton>
        <ActionButton variant="outline" onClick={copyShareSummary}>
          Share Summary
        </ActionButton>
      </div>

      {/* FR-1.5.16: Testimonial Request Modal */}
      <TestimonialRequestModal
        clientId={clientId}
        isOpen={showTestimonialModal}
        onClose={() => setShowTestimonialModal(false)}
        approvedCount={'approvedCount' in (testimonialTriggerQuery.data || {}) ? (testimonialTriggerQuery.data as { approvedCount: number }).approvedCount : stats.approved}
      />
    </div>
  );
}
