import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import * as Dialog from '@radix-ui/react-dialog';
import { Link2, Copy, Check, Calendar, Lock, Eye } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    name: string;
  };
}

export function ShareLinkModal({ isOpen, onClose, client }: ShareLinkModalProps) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [permissions, setPermissions] = useState<'view' | 'approve' | 'comment'>('view');
  const [allowedEmails, setAllowedEmails] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLinkMutation = trpc.clients.generateShareableLink.useMutation({
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}${data.url}`;
      setGeneratedLink(fullUrl);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const emailList = allowedEmails
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    generateLinkMutation.mutate({
      clientId: client.id,
      expiresInDays,
      permissions,
      allowedEmails: emailList.length > 0 ? emailList : undefined,
    });
  };

  const handleCopy = async () => {
    if (!generatedLink) return;

    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedLink(null);
    setExpiresInDays(7);
    setPermissions('view');
    setAllowedEmails('');
    setCopied(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[550px] p-6 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <Dialog.Title className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Generate Shareable Review Link
          </Dialog.Title>
          <Dialog.Description className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Create a secure link for {client.name} content review
          </Dialog.Description>

          {!generatedLink ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Expiration */}
              <div className="space-y-1.5">
                <label htmlFor="expiration" className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-4 h-4" />
                  Link Expiration
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="expiration"
                    type="range"
                    min="1"
                    max="30"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span
                    className="px-3 py-1.5 rounded-lg font-medium text-sm min-w-[80px] text-center"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  >
                    {expiresInDays} days
                  </span>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Eye className="w-4 h-4" />
                  Permissions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'view', label: 'View Only', description: 'Can view content' },
                    { value: 'comment', label: 'Comment', description: 'Can add comments' },
                    { value: 'approve', label: 'Approve', description: 'Can approve content' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPermissions(option.value as any)}
                      className="p-3 rounded-lg border transition-all text-left"
                      style={{
                        backgroundColor: permissions === option.value ? 'var(--bg-surface)' : 'var(--bg-base)',
                        borderColor: permissions === option.value ? 'var(--edit)' : 'var(--border-subtle)',
                        borderWidth: permissions === option.value ? '2px' : '1px',
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {option.label}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allowed Emails (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="allowed-emails" className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Lock className="w-4 h-4" />
                  Restrict to Emails (Optional)
                </label>
                <input
                  id="allowed-emails"
                  type="text"
                  value={allowedEmails}
                  onChange={(e) => setAllowedEmails(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Leave empty to allow anyone with the link. Separate multiple emails with commas.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={generateLinkMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
                >
                  <Link2 className="w-4 h-4" />
                  {generateLinkMutation.isPending ? 'Generating...' : 'Generate Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Success Message */}
              <div
                className="p-4 rounded-lg flex items-start gap-3"
                style={{ backgroundColor: 'var(--approve)', color: '#000' }}
              >
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Link Generated Successfully!</p>
                  <p className="text-sm mt-0.5">
                    Share this link with your team or clients. It will expire in {expiresInDays} days.
                  </p>
                </div>
              </div>

              {/* Generated Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border font-mono text-sm"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: copied ? 'var(--approve)' : 'var(--edit)',
                      color: copied ? '#000' : '#fff',
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Link Details */}
              <div
                className="p-3 rounded-lg space-y-1.5 text-sm"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
              >
                <div className="flex justify-between">
                  <span>Permissions:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium capitalize">
                    {permissions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expires in:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {expiresInDays} days
                  </span>
                </div>
                {allowedEmails && (
                  <div className="flex justify-between">
                    <span>Restricted to:</span>
                    <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                      {allowedEmails.split(',').length} email{allowedEmails.split(',').length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                >
                  Generate Another
                </button>
                <Dialog.Close asChild>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
                  >
                    Done
                  </button>
                </Dialog.Close>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
