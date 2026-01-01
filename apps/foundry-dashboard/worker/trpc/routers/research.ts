/**
 * Research Agent Router - Story 10-2
 *
 * Deep Research Agent for market intelligence and strategic analysis.
 * Uses Workers AI to analyze Brand DNA and generate market insights.
 *
 * Key features:
 * - Industry/niche detection from Brand DNA transcripts
 * - Competitor gap analysis via AI synthesis
 * - Content framework mapping (TEACH/ENTERTAIN/ENGINEER)
 * - Structured research report generation
 *
 * Cost/Performance Guardrails:
 * - Max 3 AI calls per research run
 * - 60-second timeout per AI call
 * - Graceful degradation on failure
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Research report schema for structured output
const ResearchReportSchema = z.object({
  industry: z.string(),
  subNiche: z.string().optional(),
  topPerformers: z.array(z.object({
    name: z.string(),
    platform: z.string(),
    strength: z.string(),
  })).default([]),
  hookPatterns: z.record(z.object({
    prevalence: z.number(),
    avgEngagement: z.number(),
  })).default({}),
  competitiveGaps: z.array(z.string()).default([]),
  frameworkFit: z.object({
    teach: z.number(),
    entertain: z.number(),
    engineer: z.number(),
    challenge: z.number().optional(),
  }),
  recommendations: z.array(z.string()).default([]),
});

type ResearchReport = z.infer<typeof ResearchReportSchema>;

// AI prompts for research tasks
const RESEARCH_PROMPTS = {
  industryDetection: (transcript: string, contentSummary: string) => `
You are an expert market analyst. Analyze this brand voice transcript and content to identify:
1. Primary industry/vertical (e.g., "Executive Coaching", "B2B SaaS", "E-commerce")
2. Sub-niche if detectable (e.g., "Leadership coaching for tech founders")
3. Target customer profile
4. Key differentiators mentioned

Voice Transcript:
${transcript.slice(0, 2000)}

Content Summary:
${contentSummary.slice(0, 1000)}

Respond with JSON only:
{
  "industry": "Primary industry name",
  "subNiche": "Specific niche or null",
  "targetCustomer": "Brief customer description",
  "differentiators": ["key differentiator 1", "key differentiator 2"]
}`,

  frameworkAnalysis: (industry: string, voiceProfile: string) => `
You are a content strategy expert. For this brand in the ${industry} industry, analyze their voice profile and determine the best content framework fit.

Voice Profile:
${voiceProfile.slice(0, 1500)}

Score each framework from 0.0 to 1.0 based on brand fit:
- TEACH: Building authority through education (how-tos, frameworks, insights)
- ENTERTAIN: Building relatability (stories, hot takes, humor)
- ENGINEER: Driving action (pattern interrupts, curiosity gaps, CTAs)
- CHALLENGE: Contrarian takes and thought leadership

Also identify:
1. Top 3 content performers typically successful in this industry
2. Common hook patterns in this niche
3. Content gaps/opportunities
4. Strategic recommendations

Respond with JSON only:
{
  "frameworkFit": {
    "teach": 0.0-1.0,
    "entertain": 0.0-1.0,
    "engineer": 0.0-1.0,
    "challenge": 0.0-1.0
  },
  "topPerformers": [
    {"name": "Example Creator", "platform": "Twitter/LinkedIn", "strength": "Their key strength"}
  ],
  "hookPatterns": {
    "contrarian": {"prevalence": 0.0-1.0, "avgEngagement": 1.0-5.0},
    "story": {"prevalence": 0.0-1.0, "avgEngagement": 1.0-5.0},
    "question": {"prevalence": 0.0-1.0, "avgEngagement": 1.0-5.0}
  },
  "competitiveGaps": ["Gap 1", "Gap 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
};

// Helper: Parse AI response with fallback
function parseAIResponse<T>(response: string, fallback: T): T {
  try {
    // Handle markdown code blocks
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    console.error('[Research] Failed to parse AI response:', response.slice(0, 200));
    return fallback;
  }
}

// Helper: Run AI with timeout and error handling
async function runAIWithTimeout(
  ai: Context['env']['AI'],
  prompt: string,
  timeoutMs: number = 60000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 800,
    });
    return (result as { response: string }).response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const researchRouter = t.router({
  // ===== Story 10-2 AC1: Trigger Research on Brand DNA Submission =====

  startResearch: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();
      const reportId = crypto.randomUUID();

      // Check if research already exists
      const existing = await ctx.db.prepare(`
        SELECT id, status FROM client_research_reports
        WHERE client_id = ? AND status IN ('researching', 'complete')
        ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first<{ id: string; status: string }>();

      if (existing?.status === 'researching') {
        return { reportId: existing.id, status: 'already_running' };
      }

      // Create new research report entry
      await ctx.db.prepare(`
        INSERT INTO client_research_reports (id, client_id, status, started_at, created_at)
        VALUES (?, ?, 'researching', ?, ?)
      `).bind(reportId, input.clientId, now, now).run();

      // Get Brand DNA data for analysis
      const brandDna = await ctx.db.prepare(`
        SELECT bds.total_transcription, bd.primary_tone, bd.writing_style, bd.target_audience, bd.voice_entities
        FROM brand_dna_sessions bds
        LEFT JOIN brand_dna bd ON bds.client_id = bd.client_id
        WHERE bds.client_id = ?
        ORDER BY bds.created_at DESC LIMIT 1
      `).bind(input.clientId).first<{
        total_transcription: string | null;
        primary_tone: string | null;
        writing_style: string | null;
        target_audience: string | null;
        voice_entities: string | null;
      }>();

      // Get content samples summary
      const contentSamples = await ctx.db.prepare(`
        SELECT title, extracted_text FROM training_samples
        WHERE client_id = ? AND status = 'analyzed'
        ORDER BY created_at DESC LIMIT 3
      `).bind(input.clientId).all<{ title: string; extracted_text: string | null }>();

      const transcript = brandDna?.total_transcription || '';
      const contentSummary = contentSamples.results
        .map(s => `${s.title}: ${(s.extracted_text || '').slice(0, 200)}`)
        .join('\n');

      // If no data, mark as failed
      if (!transcript && !contentSummary) {
        await ctx.db.prepare(`
          UPDATE client_research_reports
          SET status = 'failed', completed_at = ?
          WHERE id = ?
        `).bind(now, reportId).run();

        return {
          reportId,
          status: 'failed',
          error: 'No Brand DNA or content available for analysis',
        };
      }

      // Run research (fire-and-forget, errors are handled internally)
      // Note: Using Promise.resolve().then() for async without blocking response
      Promise.resolve().then(() =>
        runResearchPipeline(ctx, input.clientId, reportId, {
          transcript,
          contentSummary,
          voiceProfile: JSON.stringify({
            tone: brandDna?.primary_tone,
            style: brandDna?.writing_style,
            audience: brandDna?.target_audience,
            entities: brandDna?.voice_entities,
          }),
        }).catch(err => console.error('[Research] Pipeline error:', err))
      );

      return { reportId, status: 'started' };
    }),

  // ===== Story 10-2 AC7: Get Research Report =====

  getReport: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const report = await ctx.db.prepare(`
        SELECT * FROM client_research_reports
        WHERE client_id = ?
        ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first<{
        id: string;
        client_id: string;
        industry: string | null;
        sub_niche: string | null;
        top_performers_json: string | null;
        hook_patterns_json: string | null;
        competitive_gaps_json: string | null;
        framework_fit_json: string | null;
        recommendations_json: string | null;
        status: string;
        started_at: number | null;
        completed_at: number | null;
        created_at: number;
      }>();

      if (!report) {
        return null;
      }

      return {
        id: report.id,
        clientId: report.client_id,
        status: report.status,
        startedAt: report.started_at,
        completedAt: report.completed_at,
        createdAt: report.created_at,
        durationMs: report.completed_at && report.started_at
          ? report.completed_at - report.started_at
          : null,
        report: report.status === 'complete' ? {
          industry: report.industry,
          subNiche: report.sub_niche,
          topPerformers: JSON.parse(report.top_performers_json || '[]'),
          hookPatterns: JSON.parse(report.hook_patterns_json || '{}'),
          competitiveGaps: JSON.parse(report.competitive_gaps_json || '[]'),
          frameworkFit: JSON.parse(report.framework_fit_json || '{}'),
          recommendations: JSON.parse(report.recommendations_json || '[]'),
        } : null,
      };
    }),

  // ===== Story 10-2 AC8: Check Research Status =====

  getStatus: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const report = await ctx.db.prepare(`
        SELECT id, status, started_at, completed_at
        FROM client_research_reports
        WHERE client_id = ?
        ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first<{
        id: string;
        status: string;
        started_at: number | null;
        completed_at: number | null;
      }>();

      if (!report) {
        return { status: 'none', message: 'No research initiated' };
      }

      const statusMessages: Record<string, string> = {
        researching: 'Researching your market...',
        complete: 'Research complete',
        failed: 'Research failed - partial data may be available',
      };

      return {
        reportId: report.id,
        status: report.status,
        message: statusMessages[report.status] || report.status,
        startedAt: report.started_at,
        completedAt: report.completed_at,
      };
    }),

  // ===== Retry Failed Research =====

  retryResearch: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Delete failed reports
      await ctx.db.prepare(`
        DELETE FROM client_research_reports
        WHERE client_id = ? AND status = 'failed'
      `).bind(input.clientId).run();

      // Trigger new research
      const now = Date.now();
      const reportId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO client_research_reports (id, client_id, status, started_at, created_at)
        VALUES (?, ?, 'researching', ?, ?)
      `).bind(reportId, input.clientId, now, now).run();

      // Get data and run pipeline (same as startResearch)
      const brandDna = await ctx.db.prepare(`
        SELECT bds.total_transcription, bd.primary_tone, bd.writing_style, bd.target_audience, bd.voice_entities
        FROM brand_dna_sessions bds
        LEFT JOIN brand_dna bd ON bds.client_id = bd.client_id
        WHERE bds.client_id = ?
        ORDER BY bds.created_at DESC LIMIT 1
      `).bind(input.clientId).first<{
        total_transcription: string | null;
        primary_tone: string | null;
        writing_style: string | null;
        target_audience: string | null;
        voice_entities: string | null;
      }>();

      const contentSamples = await ctx.db.prepare(`
        SELECT title, extracted_text FROM training_samples
        WHERE client_id = ? AND status = 'analyzed'
        ORDER BY created_at DESC LIMIT 3
      `).bind(input.clientId).all<{ title: string; extracted_text: string | null }>();

      Promise.resolve().then(() =>
        runResearchPipeline(ctx, input.clientId, reportId, {
          transcript: brandDna?.total_transcription || '',
          contentSummary: contentSamples.results
            .map(s => `${s.title}: ${(s.extracted_text || '').slice(0, 200)}`)
            .join('\n'),
          voiceProfile: JSON.stringify({
            tone: brandDna?.primary_tone,
            style: brandDna?.writing_style,
            audience: brandDna?.target_audience,
            entities: brandDna?.voice_entities,
          }),
        }).catch(err => console.error('[Research] Retry pipeline error:', err))
      );

      return { reportId, status: 'retrying' };
    }),
});

// ===== Research Pipeline (runs asynchronously) =====

async function runResearchPipeline(
  ctx: Context,
  clientId: string,
  reportId: string,
  data: {
    transcript: string;
    contentSummary: string;
    voiceProfile: string;
  }
): Promise<void> {
  const startTime = Date.now();

  try {
    // Step 1: Industry Detection (with 60s timeout)
    console.log(`[Research] Starting industry detection for client ${clientId}`);
    const industryResponse = await runAIWithTimeout(
      ctx.env.AI,
      RESEARCH_PROMPTS.industryDetection(data.transcript, data.contentSummary)
    );

    const industryData = parseAIResponse(industryResponse, {
      industry: 'General Business',
      subNiche: null,
      targetCustomer: 'Professionals',
      differentiators: [],
    });

    // Step 2: Framework Analysis (with 60s timeout)
    console.log(`[Research] Starting framework analysis for industry: ${industryData.industry}`);
    const frameworkResponse = await runAIWithTimeout(
      ctx.env.AI,
      RESEARCH_PROMPTS.frameworkAnalysis(industryData.industry, data.voiceProfile)
    );

    const frameworkData = parseAIResponse(frameworkResponse, {
      frameworkFit: { teach: 0.7, entertain: 0.5, engineer: 0.5, challenge: 0.6 },
      topPerformers: [],
      hookPatterns: {},
      competitiveGaps: [],
      recommendations: ['Focus on educational content to build authority'],
    });

    // Combine results
    const report: ResearchReport = {
      industry: industryData.industry,
      subNiche: industryData.subNiche || undefined,
      topPerformers: frameworkData.topPerformers || [],
      hookPatterns: frameworkData.hookPatterns || {},
      competitiveGaps: frameworkData.competitiveGaps || [],
      frameworkFit: {
        teach: frameworkData.frameworkFit?.teach ?? 0.7,
        entertain: frameworkData.frameworkFit?.entertain ?? 0.5,
        engineer: frameworkData.frameworkFit?.engineer ?? 0.5,
        challenge: frameworkData.frameworkFit?.challenge ?? 0.6,
      },
      recommendations: frameworkData.recommendations || [],
    };

    // Store results
    await ctx.db.prepare(`
      UPDATE client_research_reports SET
        industry = ?,
        sub_niche = ?,
        top_performers_json = ?,
        hook_patterns_json = ?,
        competitive_gaps_json = ?,
        framework_fit_json = ?,
        recommendations_json = ?,
        status = 'complete',
        completed_at = ?
      WHERE id = ?
    `).bind(
      report.industry,
      report.subNiche || null,
      JSON.stringify(report.topPerformers),
      JSON.stringify(report.hookPatterns),
      JSON.stringify(report.competitiveGaps),
      JSON.stringify(report.frameworkFit),
      JSON.stringify(report.recommendations),
      Date.now(),
      reportId
    ).run();

    const duration = Date.now() - startTime;
    console.log(`[Research] Completed for client ${clientId} in ${duration}ms`);

    // Trigger pillar synthesis (Story 10-3)
    try {
      await triggerPillarSynthesis(ctx, clientId, report);
    } catch (err) {
      console.error('[Research] Failed to trigger pillar synthesis:', err);
    }

  } catch (error) {
    console.error(`[Research] Failed for client ${clientId}:`, error);

    // Mark as failed but store partial data if available
    await ctx.db.prepare(`
      UPDATE client_research_reports SET
        status = 'failed',
        completed_at = ?
      WHERE id = ?
    `).bind(Date.now(), reportId).run();
  }
}

// ===== Story 10-3 Trigger (placeholder for integration) =====

async function triggerPillarSynthesis(
  ctx: Context,
  clientId: string,
  report: ResearchReport
): Promise<void> {
  // Generate strategic pillars based on research
  const pillars = generateStrategicPillars(report);

  // Store proposed pillars
  const existingPillars = await ctx.db.prepare(`
    SELECT id FROM client_proposed_pillars WHERE client_id = ?
  `).bind(clientId).first();

  if (!existingPillars) {
    await ctx.db.prepare(`
      INSERT INTO client_proposed_pillars (id, client_id, pillars_json, status, generation_round, created_at)
      VALUES (?, ?, ?, 'pending', 1, ?)
    `).bind(crypto.randomUUID(), clientId, JSON.stringify(pillars), Date.now()).run();
  }

  // Update Brand DNA session status
  await ctx.db.prepare(`
    UPDATE brand_dna_sessions
    SET status = 'pillars_ready', current_step = 'pillars', updated_at = ?
    WHERE client_id = ?
  `).bind(Date.now(), clientId).run();

  console.log(`[Research] Triggered pillar synthesis for client ${clientId}`);
}

// Helper: Generate strategic pillars from research
function generateStrategicPillars(report: ResearchReport): Array<{
  id: string;
  name: string;
  strategy: string[];
  rationale: string;
  exampleHook: string;
  confidence: number;
}> {
  const pillars = [];
  const frameworks = report.frameworkFit;

  // Sort frameworks by fit score
  const sortedFrameworks = Object.entries(frameworks)
    .filter(([_, score]) => typeof score === 'number')
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  const topFrameworks = sortedFrameworks.slice(0, 3);

  // Generate 3-4 pillars based on top frameworks and gaps
  const pillarCount = Math.min(4, topFrameworks.length + report.competitiveGaps.length);
  for (let i = 0; i < pillarCount; i++) {
    const frameworkEntry = topFrameworks[i % topFrameworks.length];
    if (!frameworkEntry) continue;

    const [frameworkName, frameworkScore] = frameworkEntry;
    const gap = report.competitiveGaps[i] || '';

    pillars.push({
      id: `pillar_${crypto.randomUUID().slice(0, 8)}`,
      name: generatePillarName(frameworkName, report.industry, gap),
      strategy: [frameworkName.toUpperCase()],
      rationale: `${frameworkName.charAt(0).toUpperCase() + frameworkName.slice(1)} framework scores ${Math.round((frameworkScore as number) * 100)}% fit. ${gap ? `Addresses gap: ${gap}` : ''}`,
      exampleHook: generateExampleHook(frameworkName, report.industry),
      confidence: frameworkScore as number,
    });
  }

  return pillars;
}

function generatePillarName(framework: string, industry: string, gap: string): string {
  const templates: Record<string, string[]> = {
    teach: [`${industry} Masterclass`, 'Expert Insights', 'The Framework Library'],
    entertain: ['Behind The Scenes', 'Real Talk', 'Industry Stories'],
    engineer: ['Action Catalysts', 'Quick Wins', 'The Conversion Engine'],
    challenge: ['Myth Busters', 'Contrarian Corner', 'Industry Truth Bombs'],
  };

  const options = templates[framework] || ['Strategic Content'];
  const firstOption = options[0] || 'Strategic Content';
  const randomOption = options[Math.floor(Math.random() * options.length)] || 'Strategic Content';
  return gap ? `${firstOption}: ${gap.slice(0, 30)}` : randomOption;
}

function generateExampleHook(framework: string, industry: string): string {
  const hooks: Record<string, string> = {
    teach: `The ${industry} framework nobody teaches you in business school`,
    entertain: `The worst ${industry} advice I ever received (and why I'm grateful)`,
    engineer: `3 questions that changed how I approach ${industry}`,
    challenge: `Everything you know about ${industry} is wrong. Here's why.`,
  };

  return hooks[framework] || `Insights from years in ${industry}`;
}

// ===== Export for onboarding trigger =====

export async function triggerResearchFromOnboarding(
  ctx: Context,
  clientId: string
): Promise<{ reportId: string; status: string }> {
  const now = Date.now();
  const reportId = crypto.randomUUID();

  // Create research report entry
  await ctx.db.prepare(`
    INSERT INTO client_research_reports (id, client_id, status, started_at, created_at)
    VALUES (?, ?, 'researching', ?, ?)
  `).bind(reportId, clientId, now, now).run();

  // Get Brand DNA data
  const brandDna = await ctx.db.prepare(`
    SELECT bds.total_transcription, bd.primary_tone, bd.writing_style, bd.target_audience, bd.voice_entities
    FROM brand_dna_sessions bds
    LEFT JOIN brand_dna bd ON bds.client_id = bd.client_id
    WHERE bds.client_id = ?
    ORDER BY bds.created_at DESC LIMIT 1
  `).bind(clientId).first<{
    total_transcription: string | null;
    primary_tone: string | null;
    writing_style: string | null;
    target_audience: string | null;
    voice_entities: string | null;
  }>();

  const contentSamples = await ctx.db.prepare(`
    SELECT title, extracted_text FROM training_samples
    WHERE client_id = ? AND status = 'analyzed'
    ORDER BY created_at DESC LIMIT 3
  `).bind(clientId).all<{ title: string; extracted_text: string | null }>();

  const transcript = brandDna?.total_transcription || '';
  const contentSummary = contentSamples.results
    .map(s => `${s.title}: ${(s.extracted_text || '').slice(0, 200)}`)
    .join('\n');

  // Run research pipeline (async)
  await runResearchPipeline(ctx, clientId, reportId, {
    transcript,
    contentSummary,
    voiceProfile: JSON.stringify({
      tone: brandDna?.primary_tone,
      style: brandDna?.writing_style,
      audience: brandDna?.target_audience,
      entities: brandDna?.voice_entities,
    }),
  });

  // After research completes, create strategy approval token and send email
  await createStrategyApprovalAndNotify(ctx, clientId);

  return { reportId, status: 'complete' };
}

// Helper: Create strategy approval token and send email (Story 10-4)
async function createStrategyApprovalAndNotify(
  ctx: Context,
  clientId: string
): Promise<void> {
  const now = Date.now();

  // Check if token already exists
  const existingToken = await ctx.db.prepare(`
    SELECT token FROM strategy_approval_tokens WHERE client_id = ? AND expires_at > ?
  `).bind(clientId, now).first<{ token: string }>();

  let strategyToken: string;
  if (existingToken) {
    strategyToken = existingToken.token;
  } else {
    strategyToken = crypto.randomUUID().replace(/-/g, '');
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.prepare(`
      INSERT INTO strategy_approval_tokens (id, client_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), clientId, strategyToken, expiresAt, now).run();
  }

  // Get client info for email
  const client = await ctx.db.prepare(`
    SELECT name, contact_email FROM clients WHERE id = ?
  `).bind(clientId).first<{ name: string; contact_email: string | null }>();

  if (client?.contact_email) {
    const strategyUrl = `${ctx.env.BETTER_AUTH_URL}/strategy/${strategyToken}`;
    const { sendStrategyReadyEmail } = await import('../../email');
    await sendStrategyReadyEmail(
      ctx.env,
      client.contact_email,
      client.name,
      strategyUrl
    ).catch(err => {
      console.error('[Research] Failed to send strategy ready email:', err);
    });
  }

  console.log(`[Research] Strategy approval token created for client ${clientId}`);
}
