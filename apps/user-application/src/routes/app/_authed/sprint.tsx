/**
 * Global Sprint Route
 * 
 * Handles high-velocity content review for different buckets (High Confidence, Recent, etc.)
 */

import { createFileRoute } from '@tanstack/react-router';
import { SprintView } from '@/components/sprint';
import { z } from 'zod';

const sprintSearchSchema = z.object({
  bucket: z.enum(['high_confidence', 'needs_review', 'recent']).default('high_confidence'),
});

export const Route = createFileRoute('/app/_authed/sprint')({
  validateSearch: (search) => sprintSearchSchema.parse(search),
  component: SprintPage,
});

function SprintPage() {
  const { bucket } = Route.useSearch();
  // In a real app, we'd fetch items based on the bucket.
  // For now, SprintView uses mock data if USE_MOCK_DATA is true.
  return <SprintView projectId="global" bucket={bucket} />;
}
