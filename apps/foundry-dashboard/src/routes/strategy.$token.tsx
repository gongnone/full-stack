/**
 * Strategy Approval Page - Story 10-4: Mobile-First Client Approval Flow
 *
 * Public route for clients to review and approve their brand pillars.
 * Mobile-first design with 44px minimum touch targets.
 */

import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/lib/trpc-client'
import { useState, useCallback } from 'react'

export const Route = createFileRoute('/strategy/$token')({
  component: StrategyApprovalPage,
})

interface Pillar {
  id: string
  name: string
  strategy: string[]
  rationale: string
  exampleHook: string
  confidence: number
}

function StrategyApprovalPage() {
  const { token } = Route.useParams()
  const { data, isLoading, error } = trpc.strategy.validateStrategyToken.useQuery({ token })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'skipped'>>({})
  const [showSummary, setShowSummary] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [modifyingPillar, setModifyingPillar] = useState<Pillar | null>(null)

  const approveMutation = trpc.strategy.approvePillar.useMutation()
  const lockMutation = trpc.strategy.lockStrategy.useMutation()

  // Type guard for valid data with pillars
  const isValidData = data && data.valid && 'pillars' in data
  const pillars: Pillar[] = isValidData ? data.pillars : []
  const currentPillar = pillars[currentIndex]
  const approvedCount = Object.values(decisions).filter(d => d === 'approved').length
  const clientName = isValidData ? data.clientName : ''

  // Initialize decisions from existing approvals
  useState(() => {
    if (isValidData && data.approvedPillars) {
      const existing: Record<string, 'approved' | 'skipped'> = {}
      data.approvedPillars.forEach((name: string) => {
        const pillar = pillars.find((p: Pillar) => p.name === name)
        if (pillar) existing[pillar.id] = 'approved'
      })
      setDecisions(existing)
    }
  })

  const handleApprove = useCallback(async () => {
    if (!currentPillar) return

    await approveMutation.mutateAsync({
      token,
      pillarId: currentPillar.id,
      pillarName: currentPillar.name,
      strategyTags: currentPillar.strategy,
      rationale: currentPillar.rationale,
      exampleHook: currentPillar.exampleHook,
    })

    setDecisions(prev => ({ ...prev, [currentPillar.id]: 'approved' }))

    if (currentIndex < pillars.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setShowSummary(true)
    }
  }, [currentPillar, currentIndex, pillars.length, token, approveMutation])

  const handleSkip = useCallback(() => {
    if (!currentPillar) return

    setDecisions(prev => ({ ...prev, [currentPillar.id]: 'skipped' }))

    if (currentIndex < pillars.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setShowSummary(true)
    }
  }, [currentPillar, currentIndex, pillars.length])

  const handleApproveAll = useCallback(async () => {
    for (const pillar of pillars) {
      if (!decisions[pillar.id] || decisions[pillar.id] === 'skipped') {
        await approveMutation.mutateAsync({
          token,
          pillarId: pillar.id,
          pillarName: pillar.name,
          strategyTags: pillar.strategy,
          rationale: pillar.rationale,
          exampleHook: pillar.exampleHook,
        })
        setDecisions(prev => ({ ...prev, [pillar.id]: 'approved' }))
      }
    }
    setShowSummary(true)
  }, [pillars, decisions, token, approveMutation])

  const handleLock = useCallback(async () => {
    await lockMutation.mutateAsync({ token })
    setIsLocked(true)
  }, [token, lockMutation])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1419] text-[#E7E9EA]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1D9BF0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B98A5]">Loading your strategy...</p>
        </div>
      </div>
    )
  }

  // Error / Invalid token
  if (error || !data?.valid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1419] text-[#E7E9EA] p-4">
        <div className="text-center p-6 bg-[#1A1F26] rounded-lg border border-[#2A3038] max-w-md">
          <div className="w-16 h-16 mx-auto bg-[#F4212E]/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#F4212E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {data && 'locked' in data && data.locked ? 'Strategy Already Locked' : 'Invalid Link'}
          </h1>
          <p className="text-[#8B98A5]">
            {data && 'locked' in data && data.locked
              ? 'Your brand strategy has already been finalized.'
              : 'This link is invalid or has expired. Please ask your agency for a new link.'}
          </p>
        </div>
      </div>
    )
  }

  // Success / Locked confirmation
  if (isLocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1419] text-[#E7E9EA] p-4">
        <div className="text-center p-6 bg-[#1A1F26] rounded-lg border border-[#00D26A]/30 max-w-md animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-[#00D26A]/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Strategy Locked!</h1>
          <p className="text-[#8B98A5] mb-4">
            Your content strategy is set. Your agency will start creating content based on your approved pillars.
          </p>
          <div className="text-sm text-[#8B98A5]">
            Approved {approvedCount} of {pillars.length} pillars
          </div>
        </div>
      </div>
    )
  }

  // Summary view
  if (showSummary) {
    const canLock = approvedCount >= 3

    return (
      <div className="min-h-screen bg-[#0F1419] text-[#E7E9EA] p-4 overflow-x-hidden">
        <div className="max-w-md mx-auto pt-6">
          <h1 className="text-2xl font-bold mb-2">Review Summary</h1>
          <p className="text-[#8B98A5] mb-6">
            {approvedCount} of {pillars.length} pillars approved
          </p>

          <div className="space-y-3 mb-8">
            {pillars.map((pillar: Pillar) => (
              <div
                key={pillar.id}
                className={`p-4 rounded-lg border ${
                  decisions[pillar.id] === 'approved'
                    ? 'bg-[#00D26A]/10 border-[#00D26A]/30'
                    : 'bg-[#1A1F26] border-[#2A3038]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{pillar.name}</span>
                  {decisions[pillar.id] === 'approved' ? (
                    <span className="text-[#00D26A] text-sm">✓ Approved</span>
                  ) : (
                    <button
                      onClick={() => {
                        const idx = pillars.findIndex((p: Pillar) => p.id === pillar.id)
                        setCurrentIndex(idx)
                        setShowSummary(false)
                      }}
                      className="text-[#1D9BF0] text-sm min-h-[44px] px-3"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!canLock && (
            <p className="text-[#FFAD1F] text-sm text-center mb-4">
              Approve at least 3 pillars to lock your strategy
            </p>
          )}

          <button
            onClick={handleLock}
            disabled={!canLock || lockMutation.isPending}
            className="w-full py-4 min-h-[52px] bg-[#00D26A] text-[#0F1419] text-lg rounded-full font-bold hover:bg-[#00B85E] active:bg-[#00A050] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lockMutation.isPending ? 'Locking...' : 'Lock My Strategy'}
          </button>

          <button
            onClick={() => setShowSummary(false)}
            className="w-full mt-3 py-3 min-h-[44px] text-[#8B98A5] hover:text-[#E7E9EA] transition-colors"
          >
            Back to pillars
          </button>
        </div>
      </div>
    )
  }

  // Pillar card view
  return (
    <div className="min-h-screen bg-[#0F1419] text-[#E7E9EA] p-4 overflow-x-hidden">
      <div className="max-w-md mx-auto pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Your Brand Strategy</h1>
          <p className="text-[#8B98A5]">Hi {clientName}! Review your personalized pillars.</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {pillars.map((_: Pillar, idx: number) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx < currentIndex ? 'bg-[#00D26A]' :
                idx === currentIndex ? 'bg-[#1D9BF0]' :
                'bg-[#2A3038]'
              }`}
            />
          ))}
          <span className="text-xs text-[#8B98A5] ml-2">
            {currentIndex + 1}/{pillars.length}
          </span>
        </div>

        {/* Pillar Card */}
        {currentPillar && (
          <div className="bg-[#1A1F26] rounded-xl border border-[#2A3038] overflow-hidden mb-6 shadow-lg">
            {/* Pillar name */}
            <div className="p-6 border-b border-[#2A3038]">
              <h2 className="text-xl font-bold text-[#E7E9EA] mb-3">
                "{currentPillar.name}"
              </h2>
              {/* Strategy tags */}
              <div className="flex flex-wrap gap-2">
                {currentPillar.strategy.map((tag: string) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                      tag === 'TEACH' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' :
                      tag === 'ENTERTAIN' ? 'bg-[#F91880]/20 text-[#F91880]' :
                      tag === 'ENGINEER' ? 'bg-[#00D26A]/20 text-[#00D26A]' :
                      tag === 'CHALLENGE' ? 'bg-[#FFAD1F]/20 text-[#FFAD1F]' :
                      tag === 'PROVE' ? 'bg-[#794BC4]/20 text-[#794BC4]' :
                      'bg-[#2A3038] text-[#8B98A5]'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Rationale */}
            <div className="p-6 border-b border-[#2A3038]">
              <h3 className="text-sm font-medium text-[#8B98A5] uppercase tracking-wide mb-2">
                Why This Works For You
              </h3>
              <p className="text-[#E7E9EA] leading-relaxed">
                {currentPillar.rationale}
              </p>
            </div>

            {/* Example hook */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-[#8B98A5] uppercase tracking-wide mb-2">
                Example Content
              </h3>
              <blockquote className="text-[#E7E9EA] italic border-l-2 border-[#1D9BF0] pl-4">
                "{currentPillar.exampleHook}"
              </blockquote>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pb-8">
          <div className="flex gap-3">
            <button
              onClick={() => currentPillar && setModifyingPillar(currentPillar)}
              className="flex-1 py-3 min-h-[44px] bg-[#2A3038] text-[#E7E9EA] rounded-lg font-medium hover:bg-[#3A4048] active:bg-[#4A5058] transition-colors"
            >
              Modify
            </button>
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="flex-1 py-3 min-h-[44px] bg-[#00D26A] text-[#0F1419] rounded-lg font-bold hover:bg-[#00B85E] active:bg-[#00A050] transition-colors disabled:opacity-50"
            >
              {approveMutation.isPending ? '...' : 'Approve'}
            </button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full py-3 min-h-[44px] text-[#8B98A5] hover:text-[#E7E9EA] transition-colors"
          >
            Skip for now
          </button>

          {currentIndex === 0 && pillars.length > 1 && (
            <button
              onClick={handleApproveAll}
              disabled={approveMutation.isPending}
              className="w-full py-3 min-h-[44px] text-[#1D9BF0] hover:bg-[#1D9BF0]/10 rounded-lg transition-colors"
            >
              Approve all pillars
            </button>
          )}
        </div>
      </div>

      {/* Modify Modal */}
      {modifyingPillar && (
        <ModifyPillarModal
          pillar={modifyingPillar}
          token={token}
          onClose={() => setModifyingPillar(null)}
          onSave={(modified) => {
            // Update the pillar in local state
            setModifyingPillar(null)
          }}
        />
      )}
    </div>
  )
}

// Story 10-5: Modification Modal
function ModifyPillarModal({
  pillar,
  token,
  onClose,
  onSave,
}: {
  pillar: Pillar
  token: string
  onClose: () => void
  onSave: (modified: Pillar) => void
}) {
  const [name, setName] = useState(pillar.name)
  const [selectedTags, setSelectedTags] = useState<string[]>(pillar.strategy)
  const [note, setNote] = useState('')

  const modifyMutation = trpc.strategy.modifyPillar.useMutation()
  const alternativesMutation = trpc.strategy.getAlternatives.useMutation()

  const availableTags = ['TEACH', 'ENTERTAIN', 'ENGINEER', 'CHALLENGE', 'PROVE']

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSave = async () => {
    await modifyMutation.mutateAsync({
      token,
      pillarId: pillar.id,
      originalPillar: {
        name: pillar.name,
        strategy: pillar.strategy,
        rationale: pillar.rationale,
        exampleHook: pillar.exampleHook,
      },
      newName: name !== pillar.name ? name : undefined,
      newStrategyTags: selectedTags !== pillar.strategy ? selectedTags : undefined,
      personalNote: note || undefined,
    })
    onSave({ ...pillar, name, strategy: selectedTags })
  }

  const handleShowAlternatives = async () => {
    const result = await alternativesMutation.mutateAsync({
      token,
      pillarId: pillar.id,
    })
    // For now, just show an alert with alternatives
    // In a full implementation, this would open a selection UI
    if (result.alternatives.length > 0) {
      alert(`Alternative options:\n${result.alternatives.map((a: { name: string }) => `• ${a.name}`).join('\n')}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#1A1F26] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A3038] sticky top-0 bg-[#1A1F26]">
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] text-[#8B98A5] hover:text-[#E7E9EA]"
          >
            ✕
          </button>
          <h2 className="text-lg font-bold text-[#E7E9EA]">Modify Pillar</h2>
          <div className="w-[44px]" />
        </div>

        <div className="p-6 space-y-6">
          {/* Pillar Name */}
          <div>
            <label className="block text-sm font-medium text-[#8B98A5] mb-2">
              Pillar Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-3 min-h-[44px] bg-[#0F1419] border border-[#2A3038] rounded-lg text-[#E7E9EA] focus:border-[#1D9BF0] focus:outline-none"
            />
          </div>

          {/* Strategy Tags */}
          <div>
            <label className="block text-sm font-medium text-[#8B98A5] mb-2">
              Strategy Focus
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium uppercase tracking-wide transition-colors ${
                    selectedTags.includes(tag)
                      ? tag === 'TEACH' ? 'bg-[#1D9BF0] text-white' :
                        tag === 'ENTERTAIN' ? 'bg-[#F91880] text-white' :
                        tag === 'ENGINEER' ? 'bg-[#00D26A] text-white' :
                        tag === 'CHALLENGE' ? 'bg-[#FFAD1F] text-black' :
                        'bg-[#794BC4] text-white'
                      : 'bg-[#2A3038] text-[#8B98A5]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Note */}
          <div>
            <label className="block text-sm font-medium text-[#8B98A5] mb-2">
              Your Vision (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell us what you're thinking..."
              className="w-full px-4 py-3 h-24 bg-[#0F1419] border border-[#2A3038] rounded-lg text-[#E7E9EA] focus:border-[#1D9BF0] focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[#2A3038] space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleShowAlternatives}
              disabled={alternativesMutation.isPending}
              className="flex-1 py-3 min-h-[44px] bg-[#2A3038] text-[#E7E9EA] rounded-lg font-medium hover:bg-[#3A4048] transition-colors disabled:opacity-50"
            >
              {alternativesMutation.isPending ? '...' : 'Show Different'}
            </button>
            <button
              onClick={handleSave}
              disabled={modifyMutation.isPending}
              className="flex-1 py-3 min-h-[44px] bg-[#1D9BF0] text-white rounded-lg font-bold hover:bg-[#1A8CD8] transition-colors disabled:opacity-50"
            >
              {modifyMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
