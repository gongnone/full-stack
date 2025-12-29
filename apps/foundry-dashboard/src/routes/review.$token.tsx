import { useState, useEffect } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { ContentCard } from '@/components/review/ContentCard';

interface ReviewData {
  client: {
    id: string;
    name: string;
    brandColor: string;
  };
  permissions: 'view' | 'approve' | 'comment';
  spokes: any[];
}

export const Route = createFileRoute('/review/$token')({
  component: ShareableReviewPage,
});

function ShareableReviewPage() {
  const { token } = useParams({ from: '/review/$token' });
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewData | null>(null);

  // Validate token and email via public API
  useEffect(() => {
    if (!isVerified || !email) return;

    const validate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/review/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });

        const result = await response.json() as ReviewData | { error: string };

        if (!response.ok) {
          setError((result as { error: string }).error || 'Failed to validate link');
          return;
        }

        setData(result as ReviewData);
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  }, [isVerified, email, token]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsVerified(true);
    }
  };

  // Handle approve/reject actions
  const handleAction = async (spokeId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await fetch('/api/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, spokeId, action, reason }),
      });

      const result = await response.json() as { error?: string; success?: boolean };

      if (!response.ok) {
        alert(result.error || `Failed to ${action} content`);
        return;
      }

      // Remove the spoke from the list after action
      setData(prev => prev ? {
        ...prev,
        spokes: prev.spokes.filter((s: any) => s.id !== spokeId),
      } : null);
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="w-full max-w-md p-8 rounded-2xl border text-center" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Client Review</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Please enter your email to access the shared content.
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-black/20 border"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold transition-transform active:scale-95"
              style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
            >
              Access Review
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--edit)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={() => { setIsVerified(false); setError(null); }}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Guard against undefined data
  if (!data) {
    return null;
  }

  const { client, spokes, permissions } = data;
  const canApprove = permissions === 'approve';

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--bg-base)' }}>
      <header className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Review: {client.name}
          </h1>
          <p className="text-muted-foreground">
            {spokes.length} pieces ready for your approval
          </p>
        </div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
          style={{ backgroundColor: client.brandColor }}
        >
          {client.name.charAt(0)}
        </div>
      </header>

      {!canApprove && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', border: '1px solid' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            You have <strong>view-only</strong> access. Contact the agency to request approval permissions.
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {spokes.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            <p>No content pending review.</p>
          </div>
        ) : (
          spokes.map((spoke: any) => (
            <ContentCard
              key={spoke.id}
              spoke={spoke}
              isActive={true}
              onApprove={canApprove ? () => handleAction(spoke.id, 'approve') : undefined}
              onKill={canApprove ? () => handleAction(spoke.id, 'reject') : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
