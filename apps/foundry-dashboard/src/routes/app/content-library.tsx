import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

export const Route = createFileRoute('/app/content-library')({
  component: ContentLibrary,
});

function ContentLibrary() {
  const clientId = useClientId();
  const [newContent, setNewContent] = useState('');
  const [newPlatform, setNewPlatform] = useState('');
  const [newType, setNewType] = useState<'good' | 'bad'>('good');
  const [newNotes, setNewNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'examples' | 'audience'>('examples');
  const [urlToScrape, setUrlToScrape] = useState('');
  const [scrapeType, setScrapeType] = useState<'good' | 'bad'>('good');

  // Audience form state
  const [persona, setPersona] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [languageStyle, setLanguageStyle] = useState('');
  const [audienceInit, setAudienceInit] = useState(false);

  // Queries
  const examples = trpc.contentExamples.list.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  );
  const audience = trpc.contentExamples.getAudience.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  );

  // Initialize audience form when data loads
  if (audience.data && !audienceInit) {
    if (audience.data.persona) setPersona(audience.data.persona);
    if (audience.data.painPoints) setPainPoints(audience.data.painPoints);
    if (audience.data.languageStyle) setLanguageStyle(audience.data.languageStyle);
    setAudienceInit(true);
  }

  // Mutations
  const addExample = trpc.contentExamples.add.useMutation({
    onSuccess: () => {
      examples.refetch();
      setNewContent('');
      setNewNotes('');
    },
  });
  const removeExample = trpc.contentExamples.remove.useMutation({
    onSuccess: () => examples.refetch(),
  });
  const updateAudience = trpc.contentExamples.updateAudience.useMutation({
    onSuccess: () => audience.refetch(),
  });
  const scrapeUrl = trpc.contentExamples.scrapeUrl.useMutation({
    onSuccess: () => {
      examples.refetch();
      setUrlToScrape('');
    },
  });

  const goodExamples = ((examples.data as any[]) || []).filter((e: any) => e.type === 'good');
  const badExamples = ((examples.data as any[]) || []).filter((e: any) => e.type === 'bad');

  if (!clientId) {
    return <div className="p-6 text-gray-500">Select a client to manage their content library.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Content Library</h1>
      <p className="text-gray-500 mb-6">
        Feed your AI with examples of great content and describe your audience. Better inputs = better outputs.
      </p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('examples')}
          className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'examples' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Content Examples ({(examples.data as any[] || []).length})
        </button>
        <button
          onClick={() => setActiveTab('audience')}
          className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'audience' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Audience Profile {audience.data?.persona ? '✅' : ''}
        </button>
      </div>

      {activeTab === 'examples' && (
        <>
          {/* Add Example Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <h2 className="font-semibold mb-3">Add Content Example</h2>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setNewType('good')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${newType === 'good' ? 'bg-green-100 text-green-700 ring-2 ring-green-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                ✅ Good — "Write like this"
              </button>
              <button
                onClick={() => setNewType('bad')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${newType === 'bad' ? 'bg-red-100 text-red-700 ring-2 ring-red-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                ❌ Bad — "Never like this"
              </button>
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={newType === 'good'
                ? 'Paste your best-performing social media post here. The AI will pattern-match against this.'
                : 'Paste content you hate — generic, bland, off-brand. The AI will actively avoid this style.'}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-3 min-h-[100px] text-sm bg-white dark:bg-gray-900"
            />
            <div className="flex gap-3 mb-3">
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
              >
                <option value="">Any Platform</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="thread">Thread</option>
                <option value="carousel">Carousel</option>
              </select>
              <input
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Why is this good/bad? (optional)"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
              />
            </div>
            <button
              onClick={() => {
                if (!newContent.trim()) return;
                addExample.mutate({
                  clientId,
                  content: newContent.trim(),
                  platform: newPlatform || undefined,
                  type: newType,
                  notes: newNotes || undefined,
                });
              }}
              disabled={!newContent.trim() || addExample.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {addExample.isPending ? 'Adding...' : 'Add Example'}
            </button>
          </div>

          {/* URL Scraper */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <h2 className="font-semibold mb-2">Import from URL</h2>
            <p className="text-gray-500 text-sm mb-3">Paste a blog post, social media profile, or article URL to extract content.</p>
            <div className="flex gap-3">
              <input
                value={urlToScrape}
                onChange={(e) => setUrlToScrape(e.target.value)}
                placeholder="https://example.com/blog/great-post"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
              />
              <select
                value={scrapeType}
                onChange={(e) => setScrapeType(e.target.value as 'good' | 'bad')}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
              >
                <option value="good">✅ Good</option>
                <option value="bad">❌ Bad</option>
              </select>
              <button
                onClick={() => {
                  if (!urlToScrape.trim()) return;
                  scrapeUrl.mutate({ clientId, url: urlToScrape.trim(), type: scrapeType });
                }}
                disabled={!urlToScrape.trim() || scrapeUrl.isPending}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {scrapeUrl.isPending ? '🔄 Scraping...' : '🔗 Import'}
              </button>
            </div>
            {scrapeUrl.isError && (
              <p className="text-red-500 text-sm mt-2">❌ {scrapeUrl.error.message}</p>
            )}
            {scrapeUrl.isSuccess && (
              <p className="text-green-500 text-sm mt-2">✅ Content imported successfully</p>
            )}
          </div>

          {/* Good Examples */}
          <div className="mb-8">
            <h2 className="font-semibold mb-3 text-green-700 dark:text-green-400">
              ✅ Good Examples — "Write like this" ({goodExamples.length})
            </h2>
            {goodExamples.length === 0 ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-dashed border-green-300 dark:border-green-700 rounded-lg p-6 text-center">
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Add 3-5 of your best-performing posts. The AI will match their voice, structure, and energy.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {goodExamples.map((ex: any) => (
                  <div key={ex.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{ex.content}</p>
                        <div className="flex gap-2 mt-2">
                          {ex.platform && <span className="text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 px-2 py-0.5 rounded">{ex.platform}</span>}
                          {ex.notes && <span className="text-xs text-gray-500 italic">{ex.notes}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeExample.mutate({ clientId, exampleId: ex.id })}
                        className="text-gray-300 hover:text-red-500 ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anti-Examples */}
          <div>
            <h2 className="font-semibold mb-3 text-red-700 dark:text-red-400">
              ❌ Anti-Examples — "Never like this" ({badExamples.length})
            </h2>
            {badExamples.length === 0 ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-dashed border-red-300 dark:border-red-700 rounded-lg p-6 text-center">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Add content that represents what you never want your brand to sound like.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {badExamples.map((ex: any) => (
                  <div key={ex.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed line-through decoration-red-300">{ex.content}</p>
                        <div className="flex gap-2 mt-2">
                          {ex.platform && <span className="text-xs bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 px-2 py-0.5 rounded">{ex.platform}</span>}
                          {ex.notes && <span className="text-xs text-gray-500 italic">{ex.notes}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeExample.mutate({ clientId, exampleId: ex.id })}
                        className="text-gray-300 hover:text-red-500 ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'audience' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-1">Who are you talking to?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Describe your ideal audience. Be specific — psychographics beat demographics every time.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Audience Persona</label>
              <textarea
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., Burnt-out small business owners who've tried everything. They read posts at 11pm after closing the shop. Skeptical of marketing advice but desperate for something that works."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[80px] text-sm bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Their Pain Points</label>
              <textarea
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                placeholder="e.g., Limited time, limited budget, overwhelmed by conflicting advice, can't measure ROI, feels like shouting into the void"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[60px] text-sm bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Language Style They Respond To</label>
              <textarea
                value={languageStyle}
                onChange={(e) => setLanguageStyle(e.target.value)}
                placeholder="e.g., Direct, slightly irreverent, uses real stories, avoids corporate jargon, speaks like a friend who knows marketing"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[60px] text-sm bg-white dark:bg-gray-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  updateAudience.mutate({
                    clientId,
                    persona: persona || undefined,
                    painPoints: painPoints || undefined,
                    languageStyle: languageStyle || undefined,
                  });
                }}
                disabled={updateAudience.isPending}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {updateAudience.isPending ? 'Saving...' : 'Save Audience Profile'}
              </button>
              {updateAudience.isSuccess && (
                <span className="text-green-600 text-sm">✅ Saved — will be used in your next generation</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
