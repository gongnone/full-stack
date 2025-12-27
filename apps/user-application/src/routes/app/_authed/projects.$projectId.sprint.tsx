/**
 * Sprint View Route
 *
 * High-velocity content review interface.
 * Keyboard-driven, < 6 sec per decision target.
 */

import { createFileRoute } from '@tanstack/react-router';
import { SprintView } from '@/components/sprint';

export const Route = createFileRoute('/app/_authed/projects/$projectId/sprint')({
  component: SprintPage,
});

function SprintPage() {
  const { projectId } = Route.useParams();

  return <SprintView projectId={projectId} />;
}
