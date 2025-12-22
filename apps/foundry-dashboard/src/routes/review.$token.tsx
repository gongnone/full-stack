import { useState } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { ContentCard } from '@/components/review/ContentCard';

export const Route = createFileRoute('/review/$token')({
  component: ShareableReviewPage,
});

function ShareableReviewPage() {
  const { token } = useParams({ from: '/review/$token' });
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Validate token and email
  // In a real app, this would send an OTP to the email
  const validateQuery = trpc.clients.validateShareableLink.useQuery(
    { token, email },
    { enabled: isVerified }
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsVerified(true);
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

  if (validateQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--edit)' }} />
      </div>
    );
  }

  if (validateQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{validateQuery.error.message}</p>
        </div>
      </div>
    );
  }

  const { client, spokes } = validateQuery.data;

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

      <div className="max-w-4xl mx-auto space-y-8">
        {spokes.map((spoke: any) => (
          <ContentCard
            key={spoke.id}
            spoke={spoke}
            isActive={true}
            onApprove={() => console.log('Approved', spoke.id)}
            onKill={() => console.log('Rejected', spoke.id)}
          />
        ))}
      </div>
    </div>
  );
}
