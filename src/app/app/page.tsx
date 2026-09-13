'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { PageShell, PageIntro, Button, Notice, ActionLink, Badge, Card, ToastProvider, useToast } from '@/components/system';
import { Field, TextField, NetworkBanner, SessionGate, ShareButton, HandleInput } from '@/components/forms';
import { ReceiptCard } from '@/components/ReceiptCard';
import { useSession } from '@/hooks/useSession';
import { api, type Receipt } from '@/lib/client';

function WalletDashboardContent() {
  const wallet = useSession(),
    [handle, setHandle] = useState(''),
    [displayName, setDisplayName] = useState(''),
    [bio, setBio] = useState(''),
    [checking, setChecking] = useState(false),
    [available, setAvailable] = useState<boolean | undefined>(undefined);
  const [busy, setBusy] = useState(false),
    [receipts, setReceipts] = useState<Receipt[] | null>(null),
    [cursor, setCursor] = useState<string | null>(null);
  const profile = wallet.data?.profile;
  const { showToast } = useToast();

  useEffect(() => {
    if (!profile) return;
    api<{ receipts: Receipt[]; nextCursor: string | null }>('/api/receipts')
      .then((r) => {
        setReceipts(r.receipts);
        setCursor(r.nextCursor);
      })
      .catch((e) => showToast(e.message, 'error'));
  }, [profile, showToast]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api(
        profile ? '/api/profile' : '/api/identity/claim',
        profile ? 'PATCH' : 'POST',
        profile
          ? {
              displayName: String(
                new FormData(event.currentTarget as HTMLFormElement).get('displayName') || '',
              ),
              bio: String(new FormData(event.currentTarget as HTMLFormElement).get('bio') || ''),
            }
          : { handle, displayName },
      );
      await wallet.refresh();
      const successMsg = profile ? 'Profile saved.' : 'Your name is ready.';
      showToast(successMsg, 'success');
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function checkAvailability() {
    if (!handle) return;
    setChecking(true);
    setAvailable(undefined);
    try {
      const result = await api<{ available: boolean; reservedForLegacyOwner?: boolean }>(
        '/api/v1/handles/' + encodeURIComponent(handle),
      );
      setAvailable(result.available);
      if (result.reservedForLegacyOwner) {
        showToast('This name is held by a legacy record. Claim it using the original wallet.', 'info');
      } else if (result.available) {
        showToast('This name is available. It is reserved only when your claim succeeds.', 'success');
      } else {
        showToast('This name is already claimed.', 'error');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Name could not be checked.', 'error');
    } finally {
      setChecking(false);
    }
  }

  async function loadMore() {
    if (!cursor) return;
    try {
      const r = await api<{ receipts: Receipt[]; nextCursor: string | null }>(
        '/api/receipts?cursor=' + encodeURIComponent(cursor),
      );
      setReceipts((prev) => [...(prev || []), ...r.receipts]);
      setCursor(r.nextCursor);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load receipts.', 'error');
    }
  }

  return (
    <PageShell>
      {wallet.data && <NetworkBanner network={wallet.data.network} />}
      <PageIntro
        eyebrow="Your workspace"
        title={profile ? profile.handle + '.neet' : 'Make a name for your work.'}
      >
        Your wallet, your contributions, and the receipts you choose to share.
      </PageIntro>
      <SessionGate wallet={wallet}>
        <div className="stack">
          {profile ? (
            <>
              <div className="actions" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <Badge tone="success">Wallet control verified</Badge>
                <ActionLink href={'/' + profile.handle} variant="secondary" size="sm">
                  View public profile
                </ActionLink>
                <ShareButton path={'/' + profile.handle} />
                <Button variant="ghost" size="sm" onClick={wallet.signOut} disabled={wallet.busy}>
                  Sign out
                </Button>
              </div>

              <Card className="bg-surface-raised/50 border-border-subtle" padding="lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-action-primary/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--action-primary)" strokeWidth="2" aria-hidden="true">
                      <path d="M21 12V7H5V7M16 7l5 5-5 5M21 12H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Wallet Connected</h3>
                    <p className="text-sm text-tertiary">Your wallet is verified and ready to use</p>
                  </div>
                  <Badge tone="success">Active</Badge>
                </div>
              </Card>

              <div className="two-column">
                <section>
                  <div className="section-label">
                    <h2>Your receipts</h2>
                    <ActionLink href="/acknowledge" size="sm">
                      Acknowledge someone
                    </ActionLink>
                  </div>
                  {receipts === null ? (
                    <Notice>Loading receipts&hellip;</Notice>
                  ) : receipts.length ? (
                    receipts.map((r) => <ReceiptCard key={r.id} receipt={r} />)
                  ) : (
                    <Card className="empty-state" padding="lg">
                      <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <h3>Your first contribution belongs here.</h3>
                      <p>
                        Share your profile with a builder, or acknowledge someone who helped you.
                        New receipts start private.
                      </p>
                    </Card>
                  )}
                  {cursor && (
                    <Button variant="secondary" onClick={loadMore}>
                      Load more receipts
                    </Button>
                  )}
                </section>
                <aside className="panel">
                  <h2>Profile details</h2>
                  <form onSubmit={save}>
                    <Field
                      id="display-name"
                      name="displayName"
                      label="Display name"
                      maxLength={60}
                      defaultValue={profile.displayName || ''}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <TextField
                      id="bio"
                      name="bio"
                      label="About your contributions"
                      maxLength={280}
                      defaultValue={profile.bio || ''}
                      onChange={(e) => setBio(e.target.value)}
                    />
                    <Button type="submit" size="lg" disabled={busy}>
                      {busy ? 'Saving&hellip;' : 'Save profile'}
                    </Button>
                  </form>
                  <p className="small">
                    Your name and wallet are fixed for this MVP. These profile details are public.
                    Empty edits clear the corresponding field.
                  </p>
                </aside>
              </div>
            </>
          ) : (
            <div className="max-w-md mx-auto">
              <Card className="bg-surface-raised/50 border-border-subtle" padding="lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-action-primary/10 flex items-center justify-center mx-auto mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--action-primary)" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h2>Claim your .neet name</h2>
                  <p className="text-secondary mt-2">
                    One name per wallet on this network. Names cannot be transferred or renamed in this
                    version.
                  </p>
                </div>

                <form onSubmit={save}>
                  <HandleInput
                    id="handle"
                    label="Your name"
                    value={handle}
                    onChange={(value) => {
                      setHandle(value);
                      setAvailable(undefined);
                    }}
                    checking={checking}
                    available={available}
                    required
                    maxLength={37}
                    hint="3&ndash;32 letters, numbers or interior hyphens. We normalize to lowercase."
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy || !handle || checking}
                    onClick={checkAvailability}
                    className="w-full"
                  >
                    {checking ? 'Checking&hellip;' : 'Check availability'}
                  </Button>
                  <div style={{ height: 'var(--space-5)' }} />
                  <Field
                    id="claim-display"
                    label="Display name (optional)"
                    maxLength={60}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <TextField
                    id="claim-bio"
                    label="Bio (optional)"
                    maxLength={280}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <div className="actions" style={{ marginTop: 'var(--space-4)' }}>
                    <Button type="submit" size="lg" disabled={busy} className="flex-1">
                      {busy ? 'Saving&hellip;' : 'Claim name'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={wallet.signOut}>
                      Sign out
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="bg-surface-raised/30 border-border-subtle mt-6" padding="lg">
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--action-primary)" strokeWidth="2" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">New to Dotneet?</h3>
                    <p className="text-sm text-secondary mt-1">
                      Your .neet name becomes your portable reputation. Builders can acknowledge
                      your contributions with NIM payments and signed statements you control.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </SessionGate>
    </PageShell>
  );
}

export default function WalletDashboard() {
  return (
    <ToastProvider>
      <WalletDashboardContent />
    </ToastProvider>
  );
}