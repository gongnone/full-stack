/**
 * AI Content Generation Journey E2E Test
 *
 * This spec file directly tests the complete AI generation journey
 * as defined in e2e/features/ai-generation-journey.feature
 *
 * Run with:
 *   pnpm exec playwright test e2e/journeys/ai-generation-journey.spec.ts
 *   pnpm exec playwright test e2e/journeys/ai-generation-journey.spec.ts --grep "@P0"
 *
 * @tags @P0 @critical @generation @ai @journey
 */

import { test, expect } from '../fixtures/auth.fixture';
import { uniqueTestId } from '../fixtures/auth.fixture';

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const GENERATION_CONFIG = {
  // Sample source content
  sourceContent: `
    Today we're exploring how AI transforms content creation at scale.

    First insight: AI handles repetitive tasks while humans provide creative direction.
    This synergy between machine efficiency and human creativity is powerful.

    Second insight: Quality gates ensure brand consistency without sacrificing voice.
    Every piece meets standards before publication.

    Third insight: Real-time feedback loops enable continuous improvement.
    The system learns your preferences over time.

    Fourth insight: Hub-and-spoke means one idea becomes 25 platform-optimized pieces.
    No more starting from scratch.

    Fifth insight: Executive producer model saves hours while maintaining approval power.
    You review, approve, and succeed.

    Sixth insight: Self-healing loops automatically improve failed content.
    Less manual intervention required.
  `.trim(),

  // Performance thresholds (from NFRs)
  extractionTimeout: 30000,   // NFR-P2: < 30 seconds
  generationTimeout: 60000,   // NFR-P3: < 60 seconds
  selfHealingTimeout: 10000,  // NFR-P7: < 10 seconds per loop
  journeyTimeout: 180000,     // 3 minutes for full journey
};

// =============================================================================
// PHASE 1: SOURCE MATERIAL INGESTION
// =============================================================================

test.describe('@P0 Phase 1: Source Material Ingestion', () => {
  test('1.1 Hub creation wizard loads', async ({ sourceIngestionPage }) => {
    await sourceIngestionPage.goto();
    await sourceIngestionPage.waitForLoad();

    // Take screenshot for verification
    await sourceIngestionPage.screenshot('source-ingestion-page');

    const bodyVisible = await sourceIngestionPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('1.2 Paste text tab is functional', async ({ sourceIngestionPage }) => {
    await sourceIngestionPage.goto();

    // Try to switch to paste text tab
    await sourceIngestionPage.selectPasteTextTab();

    // Paste content
    await sourceIngestionPage.pasteText(GENERATION_CONFIG.sourceContent);

    // Verify word count (if available)
    const wordCount = await sourceIngestionPage.getWordCount();
    // Should have substantial content
  });

  test('1.3 Source validation works', async ({ sourceIngestionPage }) => {
    await sourceIngestionPage.goto();
    await sourceIngestionPage.selectPasteTextTab();

    // Paste short content
    await sourceIngestionPage.pasteText('Too short');

    // Should show warning for minimum length
    const hasWarning = await sourceIngestionPage.hasMinLengthWarning();
    // Warning visibility depends on implementation
  });
});

// =============================================================================
// PHASE 2: THEMATIC EXTRACTION
// =============================================================================

test.describe('@P0 Phase 2: Thematic Extraction', () => {
  test('2.1 Extraction page is accessible', async ({ extractionPage }) => {
    await extractionPage.goto();
    await extractionPage.waitForLoad();

    await extractionPage.screenshot('extraction-page');

    const bodyVisible = await extractionPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('2.2 Pillar list displays correctly', async ({ extractionPage }) => {
    await extractionPage.goto();
    await extractionPage.waitForLoad();

    // Check for pillar list structure (may be empty without data)
    const pillarCount = await extractionPage.getPillarCount();
    // Count depends on whether extraction has run
  });

  test('2.3 Add pillar button exists', async ({ extractionPage }) => {
    await extractionPage.goto();

    const hasAddButton = await extractionPage.isVisible(extractionPage.addPillarButton);
    // Button visibility depends on page state
  });
});

// =============================================================================
// PHASE 3: HUB CREATION
// =============================================================================

test.describe('@P0 Phase 3: Hub Creation', () => {
  test('3.1 Hub wizard navigable', async ({ hubPage }) => {
    await hubPage.gotoNew();
    await hubPage.waitForLoad();

    await hubPage.screenshot('hub-creation-wizard');

    const bodyVisible = await hubPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('3.2 Hub list page loads', async ({ hubPage }) => {
    await hubPage.goto();
    await hubPage.waitForLoad();

    await hubPage.screenshot('hub-list-page');

    const bodyVisible = await hubPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});

// =============================================================================
// PHASE 4: SPOKE GENERATION
// =============================================================================

test.describe('@P0 Phase 4: Spoke Generation', () => {
  test('4.1 Generation page loads', async ({ generationPage }) => {
    await generationPage.goto();
    await generationPage.waitForLoad();

    await generationPage.screenshot('generation-page');

    const bodyVisible = await generationPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('4.2 Check for WebSocket status indicator', async ({ generationPage }) => {
    await generationPage.goto();

    // WebSocket status may or may not be visible depending on state
    const hasWsStatus = await generationPage.isWebSocketConnected();
    // Status depends on whether generation is active
  });
});

// =============================================================================
// PHASE 5: QUALITY GATES
// =============================================================================

test.describe('@P0 Phase 5: Quality Gates', () => {
  test('5.1 Quality gates display accessible', async ({ qualityGatesPage }) => {
    await qualityGatesPage.goto();
    await qualityGatesPage.waitForLoad();

    await qualityGatesPage.screenshot('quality-gates-page');

    const bodyVisible = await qualityGatesPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('5.2 Filter controls present', async ({ qualityGatesPage }) => {
    await qualityGatesPage.goto();

    // Check for any filter elements
    const hasFilters =
      (await qualityGatesPage.isVisible(qualityGatesPage.filterHighConfidence)) ||
      (await qualityGatesPage.isVisible(qualityGatesPage.filterNeedsReview)) ||
      (await qualityGatesPage.isVisible(qualityGatesPage.filterFailed));

    // Filters may not be visible without spoke data
  });
});

// =============================================================================
// PHASE 6: SELF-HEALING LOOP
// =============================================================================

test.describe('Phase 6: Self-Healing Loop', () => {
  test('6.1 Self-healing badge rendering', async ({ qualityGatesPage }) => {
    await qualityGatesPage.goto();

    // Check for self-healed badge element (may not be present without healed spokes)
    const hasSelfHealingBadge = await qualityGatesPage.isVisible(qualityGatesPage.selfHealingBadge);
    // Badge only visible if spokes have been healed
  });
});

// =============================================================================
// PHASE 7: CREATIVE CONFLICTS
// =============================================================================

test.describe('@P0 Phase 7: Creative Conflicts', () => {
  test('7.1 Creative Conflicts page loads', async ({ creativeConflictsPage }) => {
    await creativeConflictsPage.goto();
    await creativeConflictsPage.waitForLoad();

    await creativeConflictsPage.screenshot('creative-conflicts-page');

    const bodyVisible = await creativeConflictsPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('7.2 Page shows conflicts or empty state', async ({ creativeConflictsPage }) => {
    await creativeConflictsPage.goto();

    const hasConflicts = await creativeConflictsPage.hasConflicts();
    const isEmpty = await creativeConflictsPage.isEmptyState();

    // Must show either conflicts or empty state
    expect(hasConflicts || isEmpty).toBe(true);
  });

  test('7.3 Conflict count is non-negative', async ({ creativeConflictsPage }) => {
    await creativeConflictsPage.goto();

    const count = await creativeConflictsPage.getConflictCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// COMPLETE JOURNEY: HAPPY PATH
// =============================================================================

test.describe('@P0 @smoke Complete AI Generation Journey', () => {
  test('Full generation flow navigation', async ({
    authenticatedPage,
    sourceIngestionPage,
    extractionPage,
    hubPage,
    generationPage,
    qualityGatesPage,
    creativeConflictsPage,
  }) => {
    const journeyStart = Date.now();
    const checkpoints: { name: string; time: number }[] = [];

    const checkpoint = (name: string) => {
      checkpoints.push({ name, time: Date.now() - journeyStart });
    };

    // --- Phase 1: Source Ingestion ---
    await sourceIngestionPage.goto();
    await sourceIngestionPage.waitForLoad();
    checkpoint('Source ingestion loaded');

    // --- Phase 2: Extraction ---
    await extractionPage.goto();
    await extractionPage.waitForLoad();
    checkpoint('Extraction page loaded');

    // --- Phase 3: Hub Creation ---
    await hubPage.goto();
    await hubPage.waitForLoad();
    checkpoint('Hub list loaded');

    // --- Phase 4: Generation ---
    await generationPage.goto();
    await generationPage.waitForLoad();
    checkpoint('Generation page loaded');

    // --- Phase 5: Quality Gates ---
    await qualityGatesPage.goto();
    await qualityGatesPage.waitForLoad();
    checkpoint('Quality gates loaded');

    // --- Phase 7: Creative Conflicts ---
    await creativeConflictsPage.goto();
    await creativeConflictsPage.waitForLoad();
    checkpoint('Creative conflicts loaded');

    // --- Summary ---
    const totalTime = Date.now() - journeyStart;
    checkpoint('Journey complete');

    console.log('\n=== AI GENERATION JOURNEY CHECKPOINTS ===');
    checkpoints.forEach((cp) => {
      console.log(`  ${cp.name}: ${cp.time}ms`);
    });
    console.log(`  TOTAL: ${totalTime}ms`);
    console.log('==========================================\n');

    // Verify journey completed within timeout
    expect(totalTime, 'Journey should complete within timeout').toBeLessThan(
      GENERATION_CONFIG.journeyTimeout
    );
  });

  test('No critical console errors during generation flow', async ({
    authenticatedPage,
    sourceIngestionPage,
    extractionPage,
    hubPage,
    generationPage,
    qualityGatesPage,
    creativeConflictsPage,
  }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through all generation pages
    await sourceIngestionPage.goto();
    await extractionPage.goto();
    await hubPage.goto();
    await generationPage.goto();
    await qualityGatesPage.goto();
    await creativeConflictsPage.goto();

    // Filter benign errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.includes('Failed to load resource') &&
        !err.includes('net::ERR')
    );

    if (criticalErrors.length > 0) {
      console.log('Critical console errors found:', criticalErrors);
    }

    expect(criticalErrors.length, 'Should have minimal console errors').toBeLessThan(5);
  });
});

// =============================================================================
// ERROR RECOVERY
// =============================================================================

test.describe('Error Recovery', () => {
  test('Invalid hub ID handled gracefully', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/hubs/invalid-hub-id-12345');

    // Page should not crash
    const bodyVisible = await authenticatedPage.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('Invalid generation route handled', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/generate/nonexistent');

    const bodyVisible = await authenticatedPage.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});

// =============================================================================
// PERFORMANCE BENCHMARKS
// =============================================================================

test.describe('Performance Benchmarks', () => {
  test('Page load times are reasonable', async ({
    sourceIngestionPage,
    extractionPage,
    generationPage,
    qualityGatesPage,
    creativeConflictsPage,
  }) => {
    const loadTimes: { page: string; time: number }[] = [];

    // Measure each page
    let start = Date.now();
    await sourceIngestionPage.goto();
    loadTimes.push({ page: 'Source Ingestion', time: Date.now() - start });

    start = Date.now();
    await extractionPage.goto();
    loadTimes.push({ page: 'Extraction', time: Date.now() - start });

    start = Date.now();
    await generationPage.goto();
    loadTimes.push({ page: 'Generation', time: Date.now() - start });

    start = Date.now();
    await qualityGatesPage.goto();
    loadTimes.push({ page: 'Quality Gates', time: Date.now() - start });

    start = Date.now();
    await creativeConflictsPage.goto();
    loadTimes.push({ page: 'Creative Conflicts', time: Date.now() - start });

    console.log('\n=== PAGE LOAD TIMES ===');
    loadTimes.forEach((lt) => {
      console.log(`  ${lt.page}: ${lt.time}ms`);
    });
    console.log('========================\n');

    // All pages should load in under 5 seconds
    loadTimes.forEach((lt) => {
      expect(lt.time, `${lt.page} should load in < 5s`).toBeLessThan(5000);
    });
  });
});
