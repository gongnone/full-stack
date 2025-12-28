/**
 * Page Objects Index
 * Export all page objects for use in step definitions and tests
 */

// Base
export { BasePage } from './BasePage';

// Core pages
export { DashboardPage } from './DashboardPage';
export { ClientPage } from './ClientPage';
export { BrandDnaPage } from './BrandDnaPage';
export { HubPage } from './HubPage';
export { ReviewPage } from './ReviewPage';
export { ReportPage } from './ReportPage';

// AI Generation journey pages
export { SourceIngestionPage } from './SourceIngestionPage';
export { ExtractionPage } from './ExtractionPage';
export { GenerationPage } from './GenerationPage';
export { QualityGatesPage } from './QualityGatesPage';
export type { GateScore, SpokeQuality } from './QualityGatesPage';
export { CreativeConflictsPage } from './CreativeConflictsPage';
export type { ConflictData } from './CreativeConflictsPage';
