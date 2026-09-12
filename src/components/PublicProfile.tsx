'use client';
import { useEffect, useState } from 'react';
import { api, type Profile, type Receipt } from '@/lib/client';
import { PageShell, PageIntro, Notice, Badge, ActionLink, Button } from './system';
import { NetworkBanner, ShareButton } from './forms';
import { ReceiptCard } from './ReceiptCard';
type Data = {
  profile: Profile;
  receipts: Receipt[];
  summary: {
    activeDisplayedReceipts: number;
    distinctDisplayedIssuerWallets: number;
    limit: number;
  };
};
export default function PublicProfile({ handle }: { handle: string }) {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api<Data>('/api/v1/profiles/' + encodeURIComponent(handle))
      .then((r) => {
        if (active) {
          setData(r);
          setError('');
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [handle, attempt]);
  if (!data)
    return (
      <PageShell>
        <PageIntro eyebrow=".neet profile" title={handle + '.neet'} />
        {error ? (
          <div className="stack">
            <Notice tone="error">{error}</Notice>
            <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
            <ActionLink href="/app">Open your workspace</ActionLink>
          </div>
        ) : (
          <Notice>Loading this profile…</Notice>
        )}
      </PageShell>
    );
  const p = data.profile;
  return (
    <PageShell>
      <NetworkBanner network={p.network} />
      <section className="profile-hero">
        <div className="avatar-mark" aria-hidden="true">
          {p.handle[0]}
        </div>
        <div>
          <div className="eyebrow">A home for useful work</div>
          <h1>{p.handle}.neet</h1>
          <p>{p.displayName || 'Nimiq contributor'}</p>
        </div>
        <div className="actions">
          <ShareButton path={'/' + p.handle} />
          <ActionLink href={'/acknowledge?to=' + encodeURIComponent(p.handle)}>
            Acknowledge contribution
          </ActionLink>
        </div>
      </section>
      <div className="profile-details">
        <aside>
          <Badge tone="success">Wallet control checked</Badge>
          <dl className="facts">
            <div>
              <dt>Wallet address</dt>
              <dd className="mono">{p.address}</dd>
            </div>
            <div>
              <dt>Name claimed</dt>
              <dd>{new Date(p.createdAt).toLocaleDateString('en-GB')}</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>{p.network}</dd>
            </div>
          </dl>
          {p.bio && <p style={{ marginTop: 24 }}>{p.bio}</p>}
          <p className="small">Wallet control does not establish human identity or work quality.</p>
        </aside>
        <section>
          <div className="section-label">
            <h2>Published contributions</h2>
            <Badge>{data.summary.activeDisplayedReceipts} active shown</Badge>
          </div>
          <p className="small">
            From {data.summary.distinctDisplayedIssuerWallets} distinct issuing wallets in the
            latest {data.summary.limit} public receipts. Wallets are not necessarily different
            people.
          </p>
          {data.receipts.length ? (
            data.receipts.map((r) => <ReceiptCard key={r.id} receipt={r} />)
          ) : (
            <div className="empty-state">
              <h3>No published receipts yet.</h3>
              <p>
                This person may have private contributions. Only receipts they choose to publish
                appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
