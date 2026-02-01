import { createFileRoute, useNavigate, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useSession } from '@/lib/auth-client';

export const Route = createFileRoute('/app/get-started')({
  component: GetStarted,
});

type Step = 'brand' | 'content' | 'audience' | 'generating';

function GetStarted() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('brand');

  // Brand step
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');

  // Content step
  const [bestPost, setBestPost] = useState('');
  const [worstPost, setWorstPost] = useState('');
  const [platform, setPlatform] = useState('twitter');

  // Audience step
  const [persona, setPersona] = useState('');
  const [painPoints, setPainPoints] = useState('');

  // Generation state
  const [generatingStatus, setGeneratingStatus] = useState('Setting up your brand...');
  const [error, setError] = useState('');

  const createClient = trpc.clients.create.useMutation();
  const addExample = trpc.contentExamples.add.useMutation();
  const updateAudience = trpc.contentExamples.updateAudience.useMutation();
  const quickStart = trpc.hubs.quickStart.useMutation();

  // Check if user already has a client — if so, skip to dashboard
  const clientsQuery = trpc.clients.list.useQuery(
    { userId: session?.user?.id },
    { enabled: !!session?.user?.id }
  );

  if (clientsQuery.data?.items && clientsQuery.data.items.length > 0) {
    return <Navigate to="/app" />;
  }

  async function handleGenerate() {
    setStep('generating');
    setError('');

    try {
      // 1. Create client
      setGeneratingStatus('Creating your brand profile...');
      const client = await createClient.mutateAsync({
        name: brandName || `${session?.user?.name || 'My'}'s Brand`,
        industry: industry || undefined,
      });
      const clientId = client.clientId;

      // 2. Add content examples
      if (bestPost.trim()) {
        setGeneratingStatus('Saving your best content...');
        await addExample.mutateAsync({
          clientId,
          content: bestPost.trim(),
          type: 'good',
          platform: platform || undefined,
          notes: 'From onboarding — best post',
        });
      }

      if (worstPost.trim()) {
        await addExample.mutateAsync({
          clientId,
          content: worstPost.trim(),
          type: 'bad',
          notes: 'From onboarding — content to avoid',
        });
      }

      // 3. Save audience profile
      if (persona.trim() || painPoints.trim()) {
        setGeneratingStatus('Building audience profile...');
        await updateAudience.mutateAsync({
          clientId,
          persona: persona.trim() || undefined,
          painPoints: painPoints.trim() || undefined,
        });
      }

      // 4. Quick Start — auto-create hub + pillars + trigger generation
      setGeneratingStatus('Generating your first batch of content...');
      await quickStart.mutateAsync({
        clientId,
        industry: industry || undefined,
        brandName: brandName || undefined,
      });

      setGeneratingStatus('🎉 Your content is being generated! Redirecting...');
      await new Promise(r => setTimeout(r, 2000));
      navigate({ to: '/app' });

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('audience'); // Go back so they can retry
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {(['brand', 'content', 'audience'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= ['brand', 'content', 'audience'].indexOf(step) || step === 'generating'
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Brand */}
        {step === 'brand' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Let's set up your brand</h1>
              <p className="text-[var(--text-secondary)] mt-1">This takes about 2 minutes. We'll generate your first batch of content.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Brand or Business Name</label>
              <input
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="e.g., Acme Marketing Co"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-900 text-[var(--text-primary)]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Industry</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-900 text-[var(--text-primary)]"
              >
                <option value="">Select your industry</option>
                <option value="marketing">Marketing & Advertising</option>
                <option value="saas">SaaS & Technology</option>
                <option value="ecommerce">E-Commerce & Retail</option>
                <option value="consulting">Consulting & Professional Services</option>
                <option value="health">Health & Wellness</option>
                <option value="finance">Finance & Fintech</option>
                <option value="education">Education & Coaching</option>
                <option value="real-estate">Real Estate</option>
                <option value="food">Food & Hospitality</option>
                <option value="creative">Creative & Design</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={() => setStep('content')}
              disabled={!brandName.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Content Examples */}
        {step === 'content' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Show us your best work</h1>
              <p className="text-[var(--text-secondary)] mt-1">Paste a social media post you're proud of. We'll match its voice and energy.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Your best-performing post <span className="text-[var(--text-muted)]">(recommended)</span>
              </label>
              <textarea
                value={bestPost}
                onChange={e => setBestPost(e.target.value)}
                placeholder="Paste a social media post that performed really well. This teaches the AI your voice."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-900 min-h-[120px] text-[var(--text-primary)]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Which platform? <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {['twitter', 'linkedin', 'instagram', 'tiktok'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                      platform === p
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Content you'd never post <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <textarea
                value={worstPost}
                onChange={e => setWorstPost(e.target.value)}
                placeholder="Paste something generic, bland, or off-brand. The AI will actively avoid this style."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-900 min-h-[80px] text-[var(--text-primary)]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('brand')}
                className="px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('audience')}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next →
              </button>
            </div>

            <p className="text-xs text-center text-[var(--text-muted)]">
              Don't have a post handy? You can skip this and add examples later.
            </p>
          </div>
        )}

        {/* Step 3: Audience */}
        {step === 'audience' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Who are you talking to?</h1>
              <p className="text-[var(--text-secondary)] mt-1">Describe your ideal audience. Be specific — psychographics beat demographics.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Describe your ideal reader
              </label>
              <textarea
                value={persona}
                onChange={e => setPersona(e.target.value)}
                placeholder="e.g., Burnt-out small business owners who've tried everything. They scroll at 11pm after closing the shop. Skeptical of marketing advice but desperate for something that works."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-900 min-h-[100px] text-[var(--text-primary)]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                What keeps them up at night?
              </label>
              <textarea
                value={painPoints}
                onChange={e => setPainPoints(e.target.value)}
                placeholder="e.g., Limited budget, no time for content, overwhelmed by conflicting advice, can't measure what's working"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-900 min-h-[80px] text-[var(--text-primary)]"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('content')}
                className="px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                🚀 Create My Brand
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Generating */}
        {step === 'generating' && (
          <div className="text-center space-y-6 py-12">
            <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{generatingStatus}</h1>
              <p className="text-[var(--text-secondary)] mt-2">This only takes a few seconds.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
