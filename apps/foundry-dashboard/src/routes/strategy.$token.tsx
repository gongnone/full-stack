/**
 * Strategy Approval Page - Story 10-4: Mobile-First Client Approval Flow
 *
 * Public route for clients to review and approve their brand pillars.
 * Mobile-first design with 44px minimum touch targets.
 */

import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/lib/trpc-client'
import { useState, useCallback, useRef, useEffect } from 'react'

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
          onSave={(_modified) => {
            // Update the pillar in local state
            setModifyingPillar(null)
          }}
        />
      )}
    </div>
  )
}

// Chat message interface
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Suggested refinement from AI
interface SuggestedRefinement {
  suggestedName?: string
  suggestedStrategy?: string[]
  suggestedRationale?: string
  suggestedHook?: string
}

// Story 10-5: Modification Modal with Voice Note + AI Chat Support
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
  // Tab state: 'manual' for direct editing, 'chat' for AI conversation
  const [activeTab, setActiveTab] = useState<'manual' | 'chat'>('manual')

  // Manual edit state
  const [name, setName] = useState(pillar.name)
  const [selectedTags, setSelectedTags] = useState<string[]>(pillar.strategy)
  const [note, setNote] = useState('')

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [suggestedRefinement, setSuggestedRefinement] = useState<SuggestedRefinement | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const MAX_RECORDING_SECONDS = 30

  const modifyMutation = trpc.strategy.modifyPillar.useMutation()
  const alternativesMutation = trpc.strategy.getAlternatives.useMutation()
  const transcribeMutation = trpc.strategy.transcribeVoiceNote.useMutation()
  const refineMutation = trpc.strategy.refinePillarWithAI.useMutation()

  const availableTags = ['TEACH', 'ENTERTAIN', 'ENGINEER', 'CHALLENGE', 'PROVE']

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorder?.state === 'recording') mediaRecorder.stop()
    }
  }, [mediaRecorder])

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        if (blob.size > 0) {
          setIsTranscribing(true)
          try {
            const buffer = await blob.arrayBuffer()
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

            const result = await transcribeMutation.mutateAsync({
              token,
              audioBase64: base64,
              mimeType: recorder.mimeType,
            })

            if (activeTab === 'chat') {
              // In chat mode, send transcription as chat message
              if (result.transcription) {
                handleSendChat(result.transcription)
              }
            } else {
              // In manual mode, append to note
              setNote(prev => prev ? `${prev}\n\n${result.transcription}` : result.transcription)
            }
          } catch (err) {
            console.error('Transcription failed:', err)
          } finally {
            setIsTranscribing(false)
          }
        }
        setRecordingTime(0)
      }

      recorder.start(1000)
      setMediaRecorder(recorder)
      setIsRecording(true)

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            recorder.stop()
            setIsRecording(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('Microphone access denied:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Send chat message to AI
  const handleSendChat = async (message?: string) => {
    const userMessage = message || chatInput.trim()
    if (!userMessage) return

    setChatInput('')
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage }
    setChatMessages(prev => [...prev, newUserMessage])

    try {
      const result = await refineMutation.mutateAsync({
        token,
        pillarId: pillar.id,
        currentPillar: {
          name: pillar.name,
          strategy: pillar.strategy,
          rationale: pillar.rationale,
          exampleHook: pillar.exampleHook,
        },
        userMessage,
        conversationHistory: chatMessages,
      })

      const assistantMessage: ChatMessage = { role: 'assistant', content: result.message }
      setChatMessages(prev => [...prev, assistantMessage])

      if (result.suggestedRefinement) {
        setSuggestedRefinement(result.suggestedRefinement)
        setShowPreview(true)
      }
    } catch (err) {
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Sorry, I had trouble processing that. Please try again.' }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  // Accept AI suggestion
  const handleAcceptRefinement = () => {
    if (suggestedRefinement) {
      if (suggestedRefinement.suggestedName) setName(suggestedRefinement.suggestedName)
      if (suggestedRefinement.suggestedStrategy) setSelectedTags(suggestedRefinement.suggestedStrategy)
      setSuggestedRefinement(null)
      setShowPreview(false)
      setActiveTab('manual') // Switch to manual to review/save
    }
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
    if (result.alternatives.length > 0) {
      alert(`Alternative options:\n${result.alternatives.map((a: { name: string }) => `• ${a.name}`).join('\n')}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#1A1F26] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A3038] sticky top-0 bg-[#1A1F26] z-10">
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] text-[#8B98A5] hover:text-[#E7E9EA]"
          >
            ✕
          </button>
          <h2 className="text-lg font-bold text-[#E7E9EA]">Modify Pillar</h2>
          <div className="w-[44px]" />
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#2A3038]">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-[#1D9BF0] border-b-2 border-[#1D9BF0]'
                : 'text-[#8B98A5] hover:text-[#E7E9EA]'
            }`}
          >
            Manual Edit
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-[#1D9BF0] border-b-2 border-[#1D9BF0]'
                : 'text-[#8B98A5] hover:text-[#E7E9EA]'
            }`}
          >
            AI Refine ✨
          </button>
        </div>

        {/* Manual Edit Tab */}
        {activeTab === 'manual' && (
          <>
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

              {/* Personal Note with Voice Recording */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#8B98A5]">
                    Your Vision (optional)
                  </label>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTranscribing}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                      isRecording
                        ? 'bg-[#F4212E] text-white animate-pulse'
                        : isTranscribing
                          ? 'bg-[#2A3038] text-[#8B98A5] cursor-wait'
                          : 'bg-[#2A3038] text-[#E7E9EA] hover:bg-[#3A4048]'
                    }`}
                  >
                    {isTranscribing ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Transcribing...</span>
                      </>
                    ) : isRecording ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="1" />
                        </svg>
                        <span>{recordingTime}s / {MAX_RECORDING_SECONDS}s</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>Voice Note</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={isRecording ? "Recording... speak now" : "Tell us what you're thinking, or tap Voice Note"}
                  className="w-full px-4 py-3 h-24 bg-[#0F1419] border border-[#2A3038] rounded-lg text-[#E7E9EA] focus:border-[#1D9BF0] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Manual Edit Actions */}
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
          </>
        )}

        {/* AI Chat Tab */}
        {activeTab === 'chat' && (
          <>
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-[#8B98A5] py-8">
                  <p className="mb-2">Ask me to help refine this pillar!</p>
                  <p className="text-sm">Try: "Make it more personal" or "Focus on leadership"</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#1D9BF0] text-white'
                        : 'bg-[#2A3038] text-[#E7E9EA]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {refineMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-[#2A3038] text-[#8B98A5] px-4 py-2 rounded-2xl">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Before/After Preview */}
            {showPreview && suggestedRefinement && (
              <div className="mx-4 mb-4 p-4 bg-[#0F1419] border border-[#1D9BF0] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#1D9BF0]">Suggested Changes</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSuggestedRefinement(null); setShowPreview(false) }}
                      className="px-3 py-1 text-xs text-[#8B98A5] hover:text-[#E7E9EA]"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleAcceptRefinement}
                      className="px-3 py-1 text-xs bg-[#00D26A] text-[#0F1419] rounded font-medium"
                    >
                      Accept
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {suggestedRefinement.suggestedName && (
                    <div>
                      <span className="text-[#8B98A5]">Name: </span>
                      <span className="text-[#F4212E] line-through mr-2">{pillar.name}</span>
                      <span className="text-[#00D26A]">{suggestedRefinement.suggestedName}</span>
                    </div>
                  )}
                  {suggestedRefinement.suggestedStrategy && (
                    <div>
                      <span className="text-[#8B98A5]">Strategy: </span>
                      <span className="text-[#00D26A]">{suggestedRefinement.suggestedStrategy.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 border-t border-[#2A3038]">
              <div className="flex gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`p-3 min-h-[44px] min-w-[44px] rounded-full transition-colors ${
                    isRecording
                      ? 'bg-[#F4212E] text-white animate-pulse'
                      : 'bg-[#2A3038] text-[#E7E9EA] hover:bg-[#3A4048]'
                  }`}
                >
                  {isTranscribing ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : isRecording ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                  placeholder={isRecording ? `Recording ${recordingTime}s...` : "Ask me to refine..."}
                  disabled={isRecording || isTranscribing}
                  className="flex-1 px-4 py-3 min-h-[44px] bg-[#0F1419] border border-[#2A3038] rounded-full text-[#E7E9EA] focus:border-[#1D9BF0] focus:outline-none"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim() || refineMutation.isPending}
                  className="p-3 min-h-[44px] min-w-[44px] bg-[#1D9BF0] text-white rounded-full hover:bg-[#1A8CD8] transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
