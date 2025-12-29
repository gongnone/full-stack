import { useState, useEffect } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { ActionButton } from '@/components/ui/action-button';
import { ImageIcon, Eye, Palette, Lightbulb, Check, X } from 'lucide-react';

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
            <SharedReviewCard
              key={spoke.id}
              spoke={spoke}
              canApprove={canApprove}
              onApprove={() => handleAction(spoke.id, 'approve')}
              onReject={() => handleAction(spoke.id, 'reject')}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Simplified card for shared review - only shows content and action buttons
function SharedReviewCard({
  spoke,
  canApprove,
  onApprove,
  onReject
}: {
  spoke: any;
  canApprove: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [actionTaken, setActionTaken] = useState<'approved' | 'rejected' | null>(null);

  const handleApprove = async () => {
    setActionTaken('approved');
    await onApprove();
  };

  const handleReject = async () => {
    setActionTaken('rejected');
    await onReject();
  };

  if (actionTaken) {
    return (
      <Card
        className="p-8 text-center"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          actionTaken === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {actionTaken === 'approved' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-medium">
            {actionTaken === 'approved' ? 'Approved' : 'Rejected'}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">G2 Hook</span>
            <span className="text-4xl font-bold font-mono tracking-tighter" style={{ color: getScoreColor(spoke.qualityScores?.g2_hook) }}>
              {spoke.qualityScores?.g2_hook || '??'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">G7 Engagement</span>
            <span className="text-4xl font-bold font-mono tracking-tighter" style={{ color: getScoreColor(spoke.qualityScores?.g7_engagement) }}>
              {spoke.qualityScores?.g7_engagement || '??'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Platform</span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium uppercase tracking-wider border border-white/10">
              {spoke.platform}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {spoke.createdAt ? new Date(spoke.createdAt).toLocaleDateString() : ''}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
          {spoke.content}
        </p>

        {/* Visual Concept */}
        {(spoke.visualArchetype || spoke.thumbnailConcept) && (
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Visual Concept Engine</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Palette className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Archetype</span>
                </div>
                <p className="text-sm font-medium">{spoke.visualArchetype || 'None'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Concept</span>
                </div>
                <p className="text-sm line-clamp-2">{spoke.thumbnailConcept || 'None'}</p>
              </div>
            </div>

            {spoke.imagePrompt && (
              <div className="p-4 rounded-lg bg-black/40 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2 text-blue-400/80">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Image Prompt</span>
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{spoke.imagePrompt}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar - Only show when user has approve permission */}
      {canApprove && (
        <div className="flex items-center justify-between p-6 bg-black/40 border-t border-white/5">
          <ActionButton
            variant="kill"
            onClick={handleReject}
            size="lg"
            className="px-8"
          >
            <X className="w-5 h-5 mr-2" />
            Reject
          </ActionButton>

          <ActionButton
            variant="approve"
            onClick={handleApprove}
            size="lg"
            className="px-8"
          >
            <Check className="w-5 h-5 mr-2" />
            Approve
          </ActionButton>
        </div>
      )}
    </Card>
  );
}

function getScoreColor(score?: number): string {
  if (!score) return 'var(--text-muted)';
  if (score >= 80) return '#00D26A';
  if (score >= 60) return '#FFD700';
  return '#F4212E';
}
