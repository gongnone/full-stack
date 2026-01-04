/**
 * BrandDNA Test Fixtures
 *
 * Reusable test data for BrandDNA-related tests.
 * Covers all stages of the client journey from onboarding to strategy approval.
 */

// ===========================================
// Client & Token Fixtures
// ===========================================

export const mockClient = {
  id: 'client-123',
  name: 'Acme Corp',
  industry: 'Executive Coaching',
  contactEmail: 'client@acme.com',
  logoUrl: 'https://example.com/logo.png',
  createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
};

export const mockOnboardingToken = {
  token: 'abc123def456ghi789jkl012mno345pq', // 32 char token
  clientId: mockClient.id,
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
  usedAt: null,
  createdAt: Date.now(),
};

export const mockExpiredToken = {
  ...mockOnboardingToken,
  token: 'expired-token-123',
  expiresAt: Date.now() - 1000, // Expired
};

export const mockUsedToken = {
  ...mockOnboardingToken,
  token: 'used-token-123',
  usedAt: Date.now() - 60000, // Used 1 minute ago
};

// ===========================================
// Brand DNA Session Fixtures
// ===========================================

export const mockBrandDNASession = {
  id: 'session-123',
  clientId: mockClient.id,
  status: 'complete',
  currentStep: 'complete',
  path: 'full',
  totalTranscription: 'I help tech founders become visionary leaders...',
  primaryTone: 'Professional',
  secondaryTone: 'Conversational',
  personalityTraits: JSON.stringify(['Authoritative', 'Empathetic', 'Direct']),
  platforms: JSON.stringify(['linkedin', 'twitter', 'youtube']),
  audienceResponses: JSON.stringify([
    'Tech founders 30-50, scaling companies $1M-$50M ARR',
    'They struggle with transitioning from builder to leader',
    'Want to become the visionary their team needs',
  ]),
  createdAt: Date.now() - 3600000, // 1 hour ago
  updatedAt: Date.now(),
};

export const mockVoiceSample = {
  id: 'voice-123',
  sessionId: mockBrandDNASession.id,
  r2Key: 'voice-samples/client-123/voice-1704067200000.webm',
  duration: 95000, // 95 seconds
  transcript: 'I help tech founders become visionary leaders by teaching them...',
  createdAt: Date.now() - 3000000,
};

// ===========================================
// Research Report Fixtures
// ===========================================

export const mockResearchReport = {
  id: 'report-123',
  clientId: mockClient.id,
  industry: 'Executive Coaching',
  subNiche: 'Leadership for tech founders',
  topPerformers: [
    { name: 'Alex Hormozi', platform: 'Twitter/YouTube', strength: 'Contrarian takes, value bombs' },
    { name: 'Simon Sinek', platform: 'LinkedIn', strength: 'Story-driven leadership content' },
    { name: 'Brené Brown', platform: 'All platforms', strength: 'Vulnerability + authority' },
  ],
  hookPatterns: {
    contrarian: { prevalence: 0.34, avgEngagement: 3.2 },
    story: { prevalence: 0.28, avgEngagement: 2.8 },
    question: { prevalence: 0.22, avgEngagement: 2.1 },
    statistic: { prevalence: 0.16, avgEngagement: 1.9 },
  },
  competitiveGaps: [
    'Few creators address failure stories authentically',
    'Technical founders underserved by generic leadership content',
    'Lack of tactical, actionable frameworks',
  ],
  frameworkFit: {
    teach: 0.85,
    entertain: 0.72,
    engineer: 0.68,
    challenge: 0.91,
  },
  recommendations: [
    'Lead with contrarian takes - high engagement in this niche',
    'Share personal failure stories - underserved content type',
    'Create tactical frameworks - strong authority builder',
  ],
  status: 'complete',
  startedAt: Date.now() - 300000, // 5 minutes ago
  completedAt: Date.now() - 240000, // 4 minutes ago
  createdAt: Date.now() - 300000,
};

export const mockResearchReportRow = {
  id: mockResearchReport.id,
  client_id: mockResearchReport.clientId,
  industry: mockResearchReport.industry,
  sub_niche: mockResearchReport.subNiche,
  top_performers_json: JSON.stringify(mockResearchReport.topPerformers),
  hook_patterns_json: JSON.stringify(mockResearchReport.hookPatterns),
  competitive_gaps_json: JSON.stringify(mockResearchReport.competitiveGaps),
  framework_fit_json: JSON.stringify(mockResearchReport.frameworkFit),
  recommendations_json: JSON.stringify(mockResearchReport.recommendations),
  status: mockResearchReport.status,
  started_at: mockResearchReport.startedAt,
  completed_at: mockResearchReport.completedAt,
  created_at: mockResearchReport.createdAt,
};

// ===========================================
// Pillar Fixtures
// ===========================================

export const mockProposedPillars = [
  {
    id: 'pillar_abcd1234',
    name: 'Leadership Myths Debunked',
    strategy: ['TEACH', 'CHALLENGE'],
    rationale: 'Contrarian takes get 3.2x engagement in your niche. Your voice analysis shows strong myth-buster tendencies.',
    exampleHook: 'The leadership advice that got your last CEO fired',
    confidence: 0.92,
  },
  {
    id: 'pillar_efgh5678',
    name: 'Boardroom Confessions',
    strategy: ['ENTERTAIN', 'PROVE'],
    rationale: 'Story-driven content is underused by competitors. Your candid voice is perfect for authentic failure stories.',
    exampleHook: 'I lost a $2M client because I was too proud to ask for help',
    confidence: 0.88,
  },
  {
    id: 'pillar_ijkl9012',
    name: 'The 3-Second Decision',
    strategy: ['ENGINEER'],
    rationale: 'Framework content drives saves and shares. Your "decisive not stubborn" stance translates perfectly to tactical content.',
    exampleHook: 'The framework I use to make million-dollar decisions in 3 seconds',
    confidence: 0.85,
  },
  {
    id: 'pillar_mnop3456',
    name: 'Tech Founder Survival Guide',
    strategy: ['TEACH'],
    rationale: 'Technical founders are underserved in leadership content. Your background gives you unique credibility.',
    exampleHook: "What engineering taught me about leading people (hint: it's not about optimization)",
    confidence: 0.82,
  },
];

export const mockPillarProposal = {
  id: 'proposal-123',
  clientId: mockClient.id,
  pillars: mockProposedPillars,
  status: 'pending',
  generationRound: 1,
  createdAt: Date.now() - 180000, // 3 minutes ago
};

export const mockPillarProposalRow = {
  id: mockPillarProposal.id,
  client_id: mockPillarProposal.clientId,
  pillars_json: JSON.stringify(mockPillarProposal.pillars),
  status: mockPillarProposal.status,
  generation_round: mockPillarProposal.generationRound,
  created_at: mockPillarProposal.createdAt,
};

// ===========================================
// Strategy Approval Fixtures
// ===========================================

export const mockStrategyToken = {
  id: 'strat-token-123',
  clientId: mockClient.id,
  clientName: mockClient.name,
  token: 'strategy-approval-token-123456789abc',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  lockedAt: null,
  createdAt: Date.now() - 120000, // 2 minutes ago
};

export const mockStrategyTokenRow = {
  id: mockStrategyToken.id,
  client_id: mockStrategyToken.clientId,
  client_name: mockStrategyToken.clientName,
  token: mockStrategyToken.token,
  expires_at: mockStrategyToken.expiresAt,
  locked_at: mockStrategyToken.lockedAt,
  created_at: mockStrategyToken.createdAt,
};

export const mockLockedStrategyToken = {
  ...mockStrategyTokenRow,
  locked_at: Date.now() - 60000, // Locked 1 minute ago
};

export const mockApprovedPillars = mockProposedPillars.map(pillar => ({
  id: pillar.id,
  clientId: mockClient.id,
  pillarName: pillar.name,
  strategyTags: pillar.strategy,
  rationale: pillar.rationale,
  exampleHook: pillar.exampleHook,
  approvedAt: Date.now() - 60000,
  createdAt: Date.now() - 120000,
  isActive: true,
}));

export const mockApprovedPillarRow = {
  id: mockApprovedPillars[0].id,
  client_id: mockApprovedPillars[0].clientId,
  pillar_name: mockApprovedPillars[0].pillarName,
  strategy_tags: JSON.stringify(mockApprovedPillars[0].strategyTags),
  rationale: mockApprovedPillars[0].rationale,
  example_hook: mockApprovedPillars[0].exampleHook,
  approved_at: mockApprovedPillars[0].approvedAt,
  created_at: mockApprovedPillars[0].createdAt,
  is_active: 1,
};

// ===========================================
// Testimonial Fixtures
// ===========================================

export const mockTestimonial = {
  id: 'testimonial-123',
  clientId: mockClient.id,
  clientName: mockClient.name,
  videoUrl: 'https://r2.example.com/testimonials/client-123/video.webm',
  r2Key: 'testimonials/client-123/video.webm',
  duration: 45,
  permissionPublic: true,
  transcript: 'Working with this team has been amazing...',
  sentiment: 'positive',
  status: 'approved',
  createdAt: Date.now() - 86400000, // 1 day ago
};

export const mockTestimonialRow = {
  id: mockTestimonial.id,
  client_id: mockTestimonial.clientId,
  video_url: mockTestimonial.videoUrl,
  r2_key: mockTestimonial.r2Key,
  duration: mockTestimonial.duration,
  permission_public: mockTestimonial.permissionPublic ? 1 : 0,
  transcript: mockTestimonial.transcript,
  sentiment: mockTestimonial.sentiment,
  status: mockTestimonial.status,
  created_at: mockTestimonial.createdAt,
  client_name: mockTestimonial.clientName,
  client_logo: mockClient.logoUrl,
};

// ===========================================
// Agent Message Fixtures
// ===========================================

export const mockAgentMessages = {
  welcome: {
    id: 'msg-welcome',
    role: 'agent',
    component: {
      type: 'TextMessage',
      props: {
        content: "Hi! I'm your Brand DNA Agent. I'll help you capture your unique voice and style.",
      },
    },
    sessionState: { currentStep: 'welcome', progress: 0 },
  },

  pathChoice: {
    id: 'msg-path',
    role: 'agent',
    component: {
      type: 'ButtonChoice',
      props: {
        prompt: 'How much time do you have?',
        choices: [
          { id: 'full', label: 'Full Path', description: '10-15 minutes', icon: 'sparkles' },
          { id: 'express', label: 'Express Path', description: '2-3 minutes', icon: 'zap' },
        ],
      },
    },
    sessionState: { currentStep: 'welcome', progress: 0 },
  },

  voiceCapture: {
    id: 'msg-voice',
    role: 'agent',
    component: {
      type: 'VoiceRecorder',
      props: {
        prompt: 'Tell me about your business in your own words.',
        maxDuration: 120,
        skipOption: true,
        skipText: "I'd rather type",
      },
    },
    sessionState: { currentStep: 'voice_capture', progress: 20 },
  },

  platformSelection: {
    id: 'msg-platforms',
    role: 'agent',
    component: {
      type: 'PlatformSelector',
      props: {
        prompt: 'Where does your audience hang out?',
        allPlatforms: [
          { id: 'linkedin', name: 'LinkedIn', bestFor: 'B2B thought leadership' },
          { id: 'twitter', name: 'Twitter/X', bestFor: 'Real-time engagement' },
          { id: 'instagram', name: 'Instagram', bestFor: 'Visual storytelling' },
          { id: 'youtube', name: 'YouTube', bestFor: 'Long-form authority' },
        ],
        recommended: [
          { id: 'linkedin', name: 'LinkedIn', bestFor: 'B2B thought leadership' },
          { id: 'twitter', name: 'Twitter/X', bestFor: 'Real-time engagement' },
        ],
        minSelection: 2,
        maxSelection: 4,
      },
    },
    sessionState: { currentStep: 'platform_selection', progress: 60 },
  },

  pillarProposal: {
    id: 'msg-pillars',
    role: 'agent',
    component: {
      type: 'PillarProposal',
      props: {
        prompt: "Based on your voice and market research, here are your content pillars:",
        pillars: mockProposedPillars.map(p => ({
          id: p.id,
          title: p.name,
          description: p.exampleHook,
          rationale: p.rationale,
          type: p.strategy[0],
        })),
        allowEdit: true,
        allowRegenerate: true,
      },
    },
    sessionState: { currentStep: 'pillar_proposal', progress: 80 },
  },

  complete: {
    id: 'msg-complete',
    role: 'agent',
    component: {
      type: 'BrandDNAReport',
      props: {
        personality: 'Authoritative Yet Approachable',
        tone: 'Professional with conversational edge',
        platforms: ['LinkedIn', 'Twitter/X', 'YouTube'],
        pillars: mockProposedPillars.map(p => ({ title: p.name, description: p.exampleHook })),
        audienceSnapshot: {
          demographics: 'Tech founders 30-50, scaling companies $1M-$50M ARR',
          painPoints: 'Transitioning from builder to leader, hiring executives',
          aspirations: 'Become the visionary leader their team needs',
        },
        strengthScore: 87,
        actions: [
          { id: 'complete', label: 'Complete Setup', primary: true },
          { id: 'edit', label: 'Edit Details' },
        ],
      },
    },
    sessionState: { currentStep: 'complete', progress: 100 },
  },
};

// ===========================================
// WebSocket Message Fixtures
// ===========================================

export const mockWebSocketMessages = {
  ping: { type: 'ping' },
  pong: { type: 'pong', timestamp: Date.now() },

  textInput: {
    type: 'text_input',
    payload: { text: 'My brand voice is professional and friendly' },
  },

  voiceSample: {
    type: 'voice_sample',
    payload: {
      r2Key: 'voice/sample-123.wav',
      transcript: 'Hello world',
      durationMs: 5000,
    },
  },

  pathSelection: {
    type: 'selection',
    payload: { type: 'path', selection: 'full' },
  },

  platformSelection: {
    type: 'selection',
    payload: { type: 'platforms', selection: ['linkedin', 'twitter'] },
  },

  nextStepAction: {
    type: 'action',
    payload: { action: 'next_step' },
  },

  getStateAction: {
    type: 'action',
    payload: { action: 'get_state' },
  },

  resetAction: {
    type: 'action',
    payload: { action: 'reset_session' },
  },
};

// ===========================================
// Helper Functions
// ===========================================

/**
 * Create a mock D1 database result for a single row
 */
export function createMockFirst<T>(row: T | null) {
  return async () => row;
}

/**
 * Create a mock D1 database result for multiple rows
 */
export function createMockAll<T>(rows: T[]) {
  return async () => ({ results: rows });
}

/**
 * Create a timestamp N days in the future
 */
export function futureTimestamp(days: number): number {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

/**
 * Create a timestamp N days in the past
 */
export function pastTimestamp(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

/**
 * Generate a mock 32-char token
 */
export function generateMockToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}
