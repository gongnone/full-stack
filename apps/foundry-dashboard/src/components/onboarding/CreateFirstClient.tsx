import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/lib/toast';
import { Building2, Sparkles, ArrowRight } from 'lucide-react';
import { CLIENT_CONFIG, UI_CONFIG } from '@/lib/constants';
import { SignOutButton } from '@/components/settings/SignOutButton';

/**
 * R-14 AC2/AC3: Onboarding flow for new users without clients.
 * Shown when auth.me returns clientId: null, allowing users to create their first client.
 */
export function CreateFirstClient() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    name: '',
    industry: '',
    brandColor: CLIENT_CONFIG.DEFAULT_BRAND_COLOR,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: async (data) => {
      // R-14 AC4: Invalidate queries and redirect to dashboard
      await utils.invalidate();
      addToast('Welcome to Foundry! Your first client has been created.', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);

      // Navigate to dashboard - the clientId will now be available
      navigate({ to: '/app' });
    },
    onError: (err) => {
      setIsSubmitting(false);
      addToast(`Failed to create client: ${err.message}`, 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setIsSubmitting(true);
    createClientMutation.mutate({
      name: form.name.trim(),
      industry: form.industry.trim() || undefined,
      brandColor: form.brandColor,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="absolute top-6 right-6">
        <SignOutButton />
      </div>

      <div
        className="w-full max-w-md p-8 rounded-2xl border"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--edit)' }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome to Foundry
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Create your first client to start generating content
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="client-name"
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Client Name <span style={{ color: 'var(--kill)' }}>*</span>
            </label>
            <input
              id="client-name"
              name="clientName"
              type="text"
              required
              placeholder="Enter client or brand name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              autoFocus
            />
          </div>

          {/* Industry (Optional) */}
          <div className="space-y-1.5">
            <label
              htmlFor="industry"
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Industry <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Brand Color */}
          <div className="space-y-1.5">
            <label
              htmlFor="brand-color"
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Brand Color
            </label>
            <div className="flex gap-3 items-center">
              <input
                id="brand-color"
                type="color"
                value={form.brandColor}
                onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                className="w-14 h-12 rounded-xl border cursor-pointer"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
              <input
                type="text"
                value={form.brandColor}
                onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono text-sm"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: form.brandColor }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !form.name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: 'var(--edit)',
              color: '#fff'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <p
          className="mt-6 text-xs text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          You can add more clients and team members later from the Clients page.
        </p>
      </div>
    </div>
  );
}
