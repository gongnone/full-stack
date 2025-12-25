/**
 * Story 4.2: Adversarial Critic Service
 * Display critic feedback on generated spokes with detailed gate analysis
 */

import { useState } from 'react';
import { GateBadge } from '@/components/ui';
import type { G2Breakdown } from '@/components/ui/gate-badge';
import { QUALITY_GATE_CONFIG } from '@/lib/constants';

export interface CriticFeedbackProps {
  spokeId: string;
  content: string;
  g2Score?: number;
  g2Breakdown?: G2Breakdown;
  g4Status?: string;
  g4Similarity?: number;
  g4Violations?: string[];
  g5Status?: string;
  g5Violations?: string[];
  criticNotes?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

interface FeedbackSection {
  gate: 'G2' | 'G4' | 'G5';
  title: string;
  status: 'pass' | 'warning' | 'fail';
  score?: number;
  details: string[];
  suggestions: string[];
}

export function CriticFeedback({
  spokeId,
  content,
  g2Score = 0,
  g2Breakdown,
  g4Status = 'pass',
  g4Similarity,
  g4Violations = [],
  g5Status = 'pass',
  g5Violations = [],
  criticNotes,
  onAccept,
  onReject,
}: CriticFeedbackProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Determine G2 status
  const g2Status: 'pass' | 'warning' | 'fail' =
    g2Score >= QUALITY_GATE_CONFIG.G2.PASS
      ? 'pass'
      : g2Score >= QUALITY_GATE_CONFIG.G2.WARNING
      ? 'warning'
      : 'fail';

  // Build feedback sections
  const feedbackSections: FeedbackSection[] = [
    {
      gate: 'G2',
      title: 'Hook Strength Analysis',
      status: g2Status,
      score: g2Score,
      details: [
        `Overall Score: ${g2Score}/100`,
        g2Breakdown?.hook !== undefined ? `Hook Strength: ${g2Breakdown.hook}/100` : '',
        g2Breakdown?.pattern !== undefined ? `Pattern Interrupt: ${g2Breakdown.pattern}/40` : '',
        g2Breakdown?.benefit !== undefined ? `Benefit Signal: ${g2Breakdown.benefit}/30` : '',
        g2Breakdown?.curiosity !== undefined ? `Curiosity Gap: ${g2Breakdown.curiosity}/30` : '',
      ].filter(Boolean),
      suggestions:
        g2Status === 'fail'
          ? [
              'Hook is too weak - needs stronger opening statement',
              'Consider pattern interrupt technique to grab attention',
              'Add clear benefit signal in first sentence',
              'Create curiosity gap to encourage engagement',
            ]
          : g2Status === 'warning'
          ? [
              'Hook could be stronger - test alternative openings',
              'Amplify the benefit statement',
              'Add more intrigue to the opening',
            ]
          : ['Hook is strong - ready to publish'],
    },
    {
      gate: 'G4',
      title: 'Voice Alignment Check',
      status: g4Status === 'pass' ? 'pass' : 'fail',
      details: [
        `Status: ${g4Status === 'pass' ? 'Pass' : 'Fail'}`,
        g4Similarity !== undefined ? `Cosine Similarity: ${(g4Similarity * 100).toFixed(1)}%` : '',
        ...g4Violations.map(v => `Violation: ${v}`),
      ].filter(Boolean),
      suggestions:
        g4Status !== 'pass'
          ? [
              'Content does not match brand voice profile',
              'Review tone and vocabulary alignment',
              'Consider using signature phrases from brand DNA',
              'Check for red pill topics to avoid',
            ]
          : ['Voice alignment is strong'],
    },
    {
      gate: 'G5',
      title: 'Platform Compliance',
      status: g5Status === 'pass' ? 'pass' : 'fail',
      details: [
        `Status: ${g5Status === 'pass' ? 'Pass' : 'Fail'}`,
        ...g5Violations.map(v => `Violation: ${v}`),
      ].filter(Boolean),
      suggestions:
        g5Status !== 'pass'
          ? [
              'Content violates platform constraints',
              'Adjust format to meet platform requirements',
              'Check character/word limits',
              'Review platform-specific tone guidelines',
            ]
          : ['Platform compliance verified'],
    },
  ];

  const toggleSection = (gate: string) => {
    setExpandedSection(expandedSection === gate ? null : gate);
  };

  // Overall status
  const overallPass = g2Status === 'pass' && g4Status === 'pass' && g5Status === 'pass';
  const hasWarnings = g2Status === 'warning';
  const hasFails = g2Status === 'fail' || g4Status !== 'pass' || g5Status !== 'pass';

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
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Adversarial Critic Feedback
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            AI critic evaluated this spoke across 3 quality gates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GateBadge gate="G2" score={g2Score} breakdown={g2Breakdown} />
          <GateBadge
            gate="G4"
            passed={g4Status === 'pass'}
            g4Details={{ violations: g4Violations, similarity: g4Similarity }}
          />
          <GateBadge
            gate="G5"
            passed={g5Status === 'pass'}
            g5Details={{ violations: g5Violations }}
          />
        </div>
      </div>

      {/* Overall Status Banner */}
      <div
        className="p-4 rounded-lg flex items-start gap-3"
        style={{
          backgroundColor: overallPass
            ? 'rgba(0, 210, 106, 0.1)'
            : hasFails
            ? 'rgba(244, 33, 46, 0.1)'
            : 'rgba(255, 173, 31, 0.1)',
          border: `1px solid ${
            overallPass ? '#00D26A' : hasFails ? '#F4212E' : '#FFAD1F'
          }`,
        }}
      >
        <div className="flex-shrink-0 text-2xl">
          {overallPass ? '✓' : hasFails ? '✗' : '⚠'}
        </div>
        <div className="flex-1">
          <h4
            className="font-semibold text-sm"
            style={{
              color: overallPass ? '#00D26A' : hasFails ? '#F4212E' : '#FFAD1F',
            }}
          >
            {overallPass
              ? 'Ready to Publish'
              : hasFails
              ? 'Requires Revision'
              : 'Acceptable with Caution'}
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {overallPass
              ? 'All quality gates passed. This spoke is ready for approval.'
              : hasFails
              ? 'One or more quality gates failed. Review feedback and regenerate.'
              : 'Spoke has warnings. Review carefully before publishing.'}
          </p>
        </div>
      </div>

      {/* Critic Notes */}
      {criticNotes && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Critic's Notes
          </h4>
          <p className="text-sm text-[var(--text-secondary)] italic">
            "{criticNotes}"
          </p>
        </div>
      )}

      {/* Gate Feedback Sections */}
      <div className="space-y-3">
        {feedbackSections.map((section) => {
          const isExpanded = expandedSection === section.gate;

          return (
            <div
              key={section.gate}
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.gate)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GateBadge
                    gate={section.gate}
                    score={section.gate === 'G2' ? section.score : undefined}
                    passed={section.status === 'pass'}
                    size="sm"
                  />
                  <span className="font-medium text-sm text-[var(--text-primary)]">
                    {section.title}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Details */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                      Analysis
                    </h5>
                    {section.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                      >
                        <span className="text-[var(--text-muted)]">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                      Suggestions
                    </h5>
                    {section.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                      >
                        <span
                          className={
                            section.status === 'pass'
                              ? 'text-[#00D26A]'
                              : section.status === 'warning'
                              ? 'text-[#FFAD1F]'
                              : 'text-[#F4212E]'
                          }
                        >
                          →
                        </span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Preview */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">
          Content Preview
        </h4>
        <div
          className="p-4 rounded-lg text-sm leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          {content}
        </div>
      </div>

      {/* Actions */}
      {(onAccept || onReject) && (
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
          {onReject && (
            <button
              onClick={onReject}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'rgba(244, 33, 46, 0.1)',
                color: '#F4212E',
                border: '1px solid rgba(244, 33, 46, 0.2)',
              }}
            >
              Regenerate
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#00D26A',
                color: '#000',
              }}
            >
              Accept Anyway
            </button>
          )}
        </div>
      )}
    </div>
  );
}
