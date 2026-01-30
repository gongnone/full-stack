/**
 * Vectorize namespace constants for G7 engagement prediction
 *
 * Multi-tenant isolation: Each client's data is isolated via namespaces
 * - baseline: Generic hooks by niche (shared across clients)
 * - admiredProfiles: Client-specific Instagram profile hooks
 */

export const VECTORIZE_NAMESPACES = {
  /**
   * Baseline namespace for generic high-performing hooks
   * @param niche - Content niche (e.g., 'business', 'fitness', 'finance')
   * @returns Namespace string like 'baseline_business'
   */
  baseline: (niche: string) => `baseline_${niche}`,

  /**
   * Admired profiles namespace for client-curated hooks
   * @param clientId - Unique client identifier
   * @returns Namespace string like 'client_abc123_admired'
   */
  admiredProfiles: (clientId: string) => `client_${clientId}_admired`,
} as const;
