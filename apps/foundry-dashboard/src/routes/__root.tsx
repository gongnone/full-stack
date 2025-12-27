import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/toaster';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
