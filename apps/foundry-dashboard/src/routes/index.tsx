import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/app" />;
  }

  return <Navigate to="/login" />;
}
