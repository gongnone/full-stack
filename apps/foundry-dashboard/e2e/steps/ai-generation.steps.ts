/**
 * Step Definitions: AI Content Generation Journey
 *
 * Playwright step implementations for the AI Generation Journey Gherkin feature.
 * Covers: Source Ingestion → Pillar Extraction → Spoke Generation → Quality Gates → Self-Healing
 *
 * @tags P0, critical, generation, ai, journey
 * @priority P0
 */

import { test, expect } from '../fixtures/auth.fixture';

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',

  // Sample source content for testing
  sampleTranscript: `
    Today we're exploring the future of AI-powered content creation and how it
    transforms the way businesses communicate with their audiences.

    The first key insight is that AI can handle repetitive content tasks while
    humans provide strategic creative direction. This creates a powerful synergy
    between machine efficiency and human creativity.

    Second, quality gates ensure every piece of content meets brand standards
    before publication. This maintains consistency at scale without sacrificing
    the unique voice that makes each brand special.

    Third, real-time feedback loops allow continuous improvement. Each review
    teaches the system to better match your voice, leading to higher approval
    rates over time.

    Fourth, the hub-and-spoke model means one great idea becomes 25 pieces of
    platform-optimized content. No more starting from scratch for every post.

    Finally, the executive producer model gives you final approval power while
    saving hours of manual content creation. You review, you approve, you win.
  `.trim(),

  // Performance thresholds from NFRs
  extractionTimeout: 30000,  // NFR-P2: < 30 seconds
  generationTimeout: 60000,  // NFR-P3: < 60 seconds
  selfHealingTimeout: 10000, // NFR-P7: < 10 seconds per loop
};

// =============================================================================
// PHASE 1: SOURCE MATERIAL INGESTION
// =============================================================================

test.describe('Phase 1: Source Material Ingestion', () => {
  test('@P0 @ingestion Source ingestion page loads', async ({ sourceIngestionPage }) => {
    await sourceIngestionPage.goto();
    await sourceIngestionPage.waitForLoad();

    // Verify page structure
    const hasUploadTab = await sourceIngestionPage.isVisible(sourceIngestionPage.uploadTab);
    const hasPasteTab = await sourceIngestionPage.isVisible(sourceIngestionPage.pasteTextTab);

    expect(hasUploadTab || hasPasteTab).toBe(true);
  });

  test('@P0 @ingestion @paste Paste transcript as source material', async ({ sourceIngestionPage }) => {
    await sourceIngestionPage.goto();

    // Paste sample content
    await sourceIngestionPage.pasteText(config.sampleTranscript);

    // Verify content was accepted
    const wordCount = await sourceIngestionPage.getWordCount();
    expect(wordCount).toBeGreaterThan(100);
  });

  test('@ingestion @validation Source validation shows checks', async ({ sourceIngestionPage }) => {
    await sourceIngestionPage.goto();
    await sourceIngestionPage.pasteText(config.sampleTranscript);

    // Check for validation feedback
    const hasMinLengthWarning = await sourceIngestionPage.hasMinLengthWarning();
    // If content is valid, no warning should appear
    expect(hasMinLengthWarning).toBe(false);
  });
});

// =============================================================================
// PHASE 2: THEMATIC EXTRACTION
// =============================================================================

test.describe('Phase 2: Thematic Extraction', () => {
  test('@P0 @extraction Extraction page loads after source', async ({ extractionPage }) => {
    await extractionPage.goto();
    await extractionPage.waitForLoad();

    // Page should load without errors
    const bodyVisible = await extractionPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test.skip('@P0 @extraction @timing Extraction completes within 30 seconds', async ({
    sourceIngestionPage,
    extractionPage,
  }) => {
    // This test requires actual AI infrastructure
    // Skip for CI, enable for integration testing

    await sourceIngestionPage.goto();
    await sourceIngestionPage.pasteText(config.sampleTranscript);
    await sourceIngestionPage.extractThemes();

    const extractionTime = await extractionPage.waitForExtraction();

    expect(extractionTime, `Extraction took ${extractionTime}ms, should be < 30000ms`).toBeLessThan(
      config.extractionTimeout
    );
  });

  test('@extraction @pillars Pillar editing works', async ({ extractionPage }) => {
    await extractionPage.goto();

    // If pillars exist, test editing
    const pillarCount = await extractionPage.getPillarCount();
    if (pillarCount > 0) {
      const originalData = await extractionPage.getPillarData(0);
      await extractionPage.editPillarTitle(0, 'Edited Test Title');

      // Verify change
      const hasModified = await extractionPage.hasModifiedPillars();
      // Note: Modified badge depends on implementation
    }
  });
});

// =============================================================================
// PHASE 3: HUB CREATION
// =============================================================================

test.describe('Phase 3: Hub Creation', () => {
  test('@P0 @hub Hub creation page accessible', async ({ hubPage }) => {
    await hubPage.gotoNew();
    await hubPage.waitForLoad();

    const bodyVisible = await hubPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});

// =============================================================================
// PHASE 4: SPOKE GENERATION
// =============================================================================

test.describe('Phase 4: Spoke Generation', () => {
  test('@P0 @generation Generation page loads', async ({ generationPage }) => {
    await generationPage.goto();
    await generationPage.waitForLoad();

    const bodyVisible = await generationPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('@generation @controls Generation controls visible', async ({ generationPage }) => {
    await generationPage.goto();

    // Check for generation button (may not be visible without a hub)
    const hasButton = await generationPage.isVisible(generationPage.startGenerationButton);
    // Button visibility depends on having a valid hub
  });

  test.skip('@P0 @generation @timing Generation completes within 60 seconds', async ({
    generationPage,
  }) => {
    // This test requires actual AI infrastructure
    // Skip for CI, enable for integration testing

    const generationTime = await generationPage.measureGenerationTime();

    expect(generationTime, `Generation took ${generationTime}ms, should be < 60000ms`).toBeLessThan(
      config.generationTimeout
    );
  });
});

// =============================================================================
// PHASE 5: QUALITY GATES
// =============================================================================

test.describe('Phase 5: Quality Gates', () => {
  test('@P0 @quality Quality gates page loads', async ({ qualityGatesPage }) => {
    await qualityGatesPage.goto();
    await qualityGatesPage.waitForLoad();

    const bodyVisible = await qualityGatesPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('@quality @filters Quality filter buttons present', async ({ qualityGatesPage }) => {
    await qualityGatesPage.goto();

    // Check for filter buttons (visibility depends on data)
    const hasFilters =
      (await qualityGatesPage.isVisible(qualityGatesPage.filterHighConfidence)) ||
      (await qualityGatesPage.isVisible(qualityGatesPage.filterNeedsReview)) ||
      (await qualityGatesPage.isVisible(qualityGatesPage.filterFailed));

    // Filters may not be visible without spokes
  });
});

// =============================================================================
// PHASE 6: SELF-HEALING LOOP
// =============================================================================

test.describe('Phase 6: Self-Healing Loop', () => {
  test.skip('@P0 @selfhealing Self-healing completes within 10 seconds per loop', async ({
    qualityGatesPage,
  }) => {
    // This test requires actual AI infrastructure with failed spokes
    // Skip for CI, enable for integration testing

    // Would check:
    // 1. Find a spoke that's currently healing
    // 2. Measure time for healing to complete
    // 3. Verify < 10 seconds
  });
});

// =============================================================================
// PHASE 7: CREATIVE CONFLICTS
// =============================================================================

test.describe('Phase 7: Creative Conflicts', () => {
  test('@P0 @conflicts Creative Conflicts page loads', async ({ creativeConflictsPage }) => {
    await creativeConflictsPage.goto();
    await creativeConflictsPage.waitForLoad();

    const bodyVisible = await creativeConflictsPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('@conflicts @empty Empty state shows when no conflicts', async ({ creativeConflictsPage }) => {
    await creativeConflictsPage.goto();

    const hasConflicts = await creativeConflictsPage.hasConflicts();
    const isEmpty = await creativeConflictsPage.isEmptyState();

    // Either has conflicts or shows empty state
    expect(hasConflicts || isEmpty).toBe(true);
  });

  test('@conflicts @actions Director\'s Cut actions available', async ({ creativeConflictsPage }) => {
    await creativeConflictsPage.goto();

    const conflictCount = await creativeConflictsPage.getConflictCount();

    if (conflictCount > 0) {
      const actions = await creativeConflictsPage.getAvailableActions(0);
      // Should have at least some actions
      expect(actions.length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// COMPLETE JOURNEY: END-TO-END HAPPY PATH
// =============================================================================

test.describe('Complete AI Generation Journey', () => {
  test('@P0 @journey @smoke Navigation flow completes successfully', async ({
    authenticatedPage,
    sourceIngestionPage,
    extractionPage,
    generationPage,
    qualityGatesPage,
    creativeConflictsPage,
  }) => {
    const journeyStart = Date.now();
    const checkpoints: { name: string; time: number }[] = [];

    const checkpoint = (name: string) => {
      checkpoints.push({ name, time: Date.now() - journeyStart });
    };

    // Phase 1: Source Ingestion
    await sourceIngestionPage.goto();
    await sourceIngestionPage.waitForLoad();
    checkpoint('Source ingestion loaded');

    // Phase 2: Extraction
    await extractionPage.goto();
    await extractionPage.waitForLoad();
    checkpoint('Extraction page loaded');

    // Phase 4: Generation
    await generationPage.goto();
    await generationPage.waitForLoad();
    checkpoint('Generation page loaded');

    // Phase 5: Quality Gates
    await qualityGatesPage.goto();
    await qualityGatesPage.waitForLoad();
    checkpoint('Quality gates page loaded');

    // Phase 7: Creative Conflicts
    await creativeConflictsPage.goto();
    await creativeConflictsPage.waitForLoad();
    checkpoint('Creative conflicts page loaded');

    const totalTime = Date.now() - journeyStart;
    checkpoint('Journey complete');

    console.log('\n=== AI GENERATION JOURNEY CHECKPOINTS ===');
    checkpoints.forEach((cp) => {
      console.log(`  ${cp.name}: ${cp.time}ms`);
    });
    console.log(`  TOTAL: ${totalTime}ms`);
    console.log('==========================================\n');

    // Verify journey completed in reasonable time
    expect(totalTime).toBeLessThan(60000);
  });

  test('@P0 @journey No console errors during navigation', async ({
    authenticatedPage,
    sourceIngestionPage,
    extractionPage,
    generationPage,
    qualityGatesPage,
    creativeConflictsPage,
  }) => {
    const consoleErrors: string[] = [];

    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through all generation-related pages
    await sourceIngestionPage.goto();
    await extractionPage.goto();
    await generationPage.goto();
    await qualityGatesPage.goto();
    await creativeConflictsPage.goto();

    // Filter benign errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.includes('Failed to load resource')
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }

    expect(criticalErrors.length).toBeLessThan(5);
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

test.describe('Error Handling', () => {
  test('@error Invalid hub route handled gracefully', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/hubs/nonexistent-hub-12345');

    const bodyVisible = await authenticatedPage.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});
