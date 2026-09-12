'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { PageShell, PageIntro, Button, Notice, ActionLink, Badge } from './system';
import { Field, TextField, NetworkBanner, SessionGate, ShareButton } from './forms';
import { ReceiptCard } from './ReceiptCard';
import { useSession } from '@/hooks/useSession';
import { api, type Receipt } from '@/lib/client';
export default function WalletDashboard() {
  const wallet = useSession(),
    [handle, setHandle] = useState(''),
    [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [receipts, setReceipts] = useState<Receipt[] | null>(null),
    [cursor, setCursor] = useState<string | null>(null);
  const profile = wallet.data?.profile;
  useEffect(() => {
    if (!profile) return;
    api<{ receipts: Receipt[]; nextCursor: string | null }>('/api/receipts')
      .then((r) => {
        setReceipts(r.receipts);
        setCursor(r.nextCursor);
      })
      .catch((e) => setError(e.message));
  }, [profile]);
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
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
      setMessage(profile ? 'Profile saved.' : 'Your name is ready.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function availability() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ available: boolean; reservedForLegacyOwner?: boolean }>(
        '/api/v1/handles/' + encodeURIComponent(handle),
      );
      setMessage(
        result.reservedForLegacyOwner
          ? 'This name is held by a legacy record. Claim it using the original wallet.'
          : result.available
            ? 'This name is available. It is reserved only when your claim succeeds.'
            : 'This name is already claimed.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Name could not be checked.');
    } finally {
      setBusy(false);
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
      setError(e instanceof Error ? e.message : 'Could not load receipts.');
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
          {(error || wallet.error) && <Notice tone="error">{error || wallet.error}</Notice>}
          {message && <Notice tone="success">{message}</Notice>}
          {profile ? (
            <>
              <div className="actions">
                <Badge tone="success">Wallet control checked</Badge>
                <ActionLink href={'/' + profile.handle} variant="secondary">
                  View public profile
                </ActionLink>
                <ShareButton path={'/' + profile.handle} />
                <Button variant="ghost" onClick={wallet.signOut} disabled={wallet.busy}>
                  Sign out
                </Button>
              </div>
              <div className="two-column">
                <section>
                  <div className="section-label">
                    <h2>Your receipts</h2>
                    <ActionLink href="/acknowledge" size="sm">
                      Acknowledge someone
                    </ActionLink>
                  </div>
                  {receipts === null ? (
                    <Notice>Loading receipts…</Notice>
                  ) : receipts.length ? (
                    receipts.map((r) => <ReceiptCard key={r.id} receipt={r} />)
                  ) : (
                    <div className="empty-state">
                      <h3>Your first contribution belongs here.</h3>
                      <p>
                        Share your profile with a builder, or acknowledge someone who helped you.
                        New receipts start private.
                      </p>
                    </div>
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
                    />
                    <Button type="submit" disabled={busy}>
                      Save profile
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
            <form onSubmit={save} className="panel narrow">
              <h2>Claim your .neet name</h2>
              <p>
                One name per wallet on this network. Names cannot be transferred or renamed in this
                version.
              </p>
              <Field
                id="handle"
                label="Your name"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  setMessage('');
                }}
                required
                maxLength={37}
                autoCapitalize="none"
                autoCorrect="off"
                hint="3–32 letters, numbers or interior hyphens. We normalize to lowercase."
              />
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !handle}
                onClick={availability}
              >
                Check availability
              </Button>
              <div style={{ height: 20 }} />
              <Field
                id="claim-display"
                label="Display name (optional)"
                maxLength={60}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <div className="actions">
                <Button type="submit" disabled={busy}>
                  {busy ? 'Saving…' : 'Claim name'}
                </Button>
                <Button type="button" variant="ghost" onClick={wallet.signOut}>
                  Sign out
                </Button>
              </div>
            </form>
          )}
        </div>
      </SessionGate>
    </PageShell>
  );
}
