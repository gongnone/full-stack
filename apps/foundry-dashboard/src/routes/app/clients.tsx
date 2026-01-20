/**
 * Clients Layout Route
 * Pure layout that renders child routes (index, $clientId, etc.)
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/app/clients')({
  component: ClientsLayout,
});

function ClientsLayout() {
  return <Outlet />;
}
