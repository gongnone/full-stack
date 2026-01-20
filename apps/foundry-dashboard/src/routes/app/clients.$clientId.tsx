/**
 * Client Detail Layout Route
 * Pure layout that renders child routes (index, brand-dna, settings)
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/app/clients/$clientId')({
  component: ClientDetailLayout,
});

function ClientDetailLayout() {
  return <Outlet />;
}
