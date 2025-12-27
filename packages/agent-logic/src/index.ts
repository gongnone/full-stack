export * from './rag';
export * from './config';
export * from './prompts';
export * from './platform-configs';
export { SPOKE_GENERATION_PROMPTS } from './prompts/spoke-prompts';

// Multi-Phase Halo Research Agents
export * from './agents';

// Halo Research Workflow (6-phase multi-agent orchestration)
export { runHaloResearchV2, runHaloResearchV2Legacy } from './workflows/halo-research-v2';
// Alias for backward compatibility
export { runHaloResearchV2 as runHaloResearch } from './workflows/halo-research-v2';
