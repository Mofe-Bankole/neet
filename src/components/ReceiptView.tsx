'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSession } from '@/hooks/useSession';
import { api, type Receipt, receiptLabel, ClientError } from '@/lib/client';
import { formatLuna, paymentMarker } from '@/lib/domain';
import { payContribution, signMessage, requireWalletAddress } from '@/lib/nimiq';
import { PageShell, PageIntro, Button, Notice, Badge, ActionLink, Card, ExternalLinkIcon } from './system';
import { Field, NetworkBanner, SessionGate, ShareButton } from './forms';

export default function ReceiptView({ id }: { id: string }) {
  const wallet = useSession(),
    [r, setReceipt] = useState<Receipt | null>(null),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false),
    [hash, setHash] = useState(''),
    [savedResult, setSavedResult] = useState('');
  const base = '/api/receipts/' + encodeURIComponent(id),
    storageKey = 'dotneet-payment-' + id;

  const load = useCallback(async () => {
    const result = await api<{ receipt: Receipt }>(base);
    setReceipt(result.receipt);
    return result.receipt;
  }, [base]);

  useEffect(() => {
    let active = true;
    api<{ receipt: Receipt }>(base)
      .then((next) => {
        if (active) {
          setReceipt(next.receipt);
          setError('');
        }
      })
      .catch((e) => {
        if (active) {
          setReceipt(null);
          setError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [base, wallet.data?.session?.address]);

  const issuer = Boolean(r && wallet.data?.session?.address === r.issuerAddress),
    recipient = Boolean(r && wallet.data?.session?.address === r.recipientAddress);
  const mayDisplay = Boolean(r && (r.publishedAt || issuer || recipient));

  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This action could not be completed.');
      try {
        await load();
      } catch {
        if (
          e instanceof ClientError &&
          ['UNAUTHENTICATED', 'NOT_FOUND', 'FORBIDDEN'].includes(e.code)
        ) {
          setReceipt(null);
          await wallet.refresh();
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function attach(result: string, attemptId?: string | null) {
    await api(base + '/payment', 'POST', {
      action: 'attach',
      walletResult: result,
      paymentAttemptId: attemptId,
    });
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    setSavedResult('');
  }

  async function pay() {
    await action(async () => {
      if (!r) throw new Error('Reload this receipt.');
      await requireWalletAddress(r.issuerAddress);
      const started = await api<{ receipt: Receipt }>(base + '/payment', 'POST', {
        action: 'begin',
      });
      setReceipt(started.receipt);
      let result: string;
      try {
        result = await payContribution(
          started.receipt.recipientAddress,
          Number(started.receipt.amountLuna),
          paymentMarker(id),
        );
      } catch (e) {
        if (e instanceof Error && e.name === 'PermissionDeniedError') {
          await api(base + '/payment', 'POST', {
            action: 'rejected',
            paymentAttemptId: started.receipt.paymentAttemptId,
          });
          throw new Error('You declined the wallet approval. This draft is ready when you are.');
        }
        throw new Error(
          'The wallet result is uncertain. Check your wallet history and reconcile this receipt without sending again.',
        );
      }
      try {
        sessionStorage.setItem(storageKey, result);
      } catch {}
      setSavedResult(result);
      await attach(result, started.receipt.paymentAttemptId);
      setMessage('Payment submitted. Check its confirmation before signing.');
    });
  }

  async function sign() {
    await action(async () => {
      const challenge = await api<{ message: string; complete?: boolean }>(
        base + '/acknowledgment',
        'POST',
        { action: 'challenge' },
      );
      if (!challenge.complete) {
        if (!r) throw new Error('Reload this receipt.');
        await requireWalletAddress(r.issuerAddress);
        const signature = await signMessage(challenge.message);
        await api(base + '/acknowledgment', 'POST', signature);
      }
      setMessage('Acknowledgment checked. The contributor can now choose whether to publish.');
    });
  }

  async function reconcile(event: FormEvent) {
    event.preventDefault();
    await action(async () => {
      await api(base + '/payment', 'POST', { action: 'reconcile', transactionHash: hash });
      setMessage('The matching payment was independently confirmed. No new payment was sent.');
    });
  }

  function download() {
    if (!r) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dotneet-receipt-' + r.id + '.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell>
      {r && <NetworkBanner network={r.network} />}
      <PageIntro
        eyebrow="Contribution receipt"
        title={r?.signatureVerifiedAt ? 'Useful work. Recorded.' : 'A contribution in progress.'}
      >
        Inspect the statement, the issuing wallet and the payment evidence.
      </PageIntro>
      {error && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {message && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Notice tone="success">{message}</Notice>
        </div>
      )}
      {!r || !mayDisplay ? (
        <div className="stack">
          {!error && <Notice>Loading receipt&hellip;</Notice>}
          <SessionGate wallet={wallet}>
            <Notice>
              Private receipts are visible to the issuing wallet and contributor. Sign in with the
              matching account.
            </Notice>
          </SessionGate>
          <Button
            variant="secondary"
            onClick={() =>
              action(async () => {
                await load();
              })
            }
            disabled={busy}
          >
            Reload receipt
          </Button>
        </div>
      ) : (
        <div className="receipt-layout">
          <article className="receipt-paper">
            <div className="paper-top">
              <span className="paper-brand">.neet</span>
              <span className="paper-sample">
                {r.network.toUpperCase()} &middot; {r.publishedAt ? 'PUBLIC' : 'PRIVATE'}
              </span>
            </div>
            <div className="eyebrow">For a useful contribution</div>
            <h2 className="paper-handle">{r.recipient?.handle}.neet</h2>
            <p style={{ fontSize: 'var(--text-xl)' }}>{r.statement}</p>
            <dl className="paper-details">
              <div>
                <dt>Acknowledged by</dt>
                <dd>{r.issuer?.handle}.neet</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(r.createdAt).toLocaleDateString('en-GB')}</dd>
              </div>
            </dl>
            <hr className="paper-rule" />
            <div className="paper-amount">
              {formatLuna(r.amountLuna)} <span style={{ fontSize: 'var(--text-xl)' }}>NIM</span>
            </div>
            <p className="small">
              {r.paymentState === 'CONFIRMED'
                ? 'Matching payment checked by Dotneet.'
                : 'Intended amount. Payment has not been confirmed.'}
            </p>
            <hr className="paper-rule" />
            <p>
              <strong>{receiptLabel(r)}</strong>
            </p>
            {r.withdrawnAt && (
              <p>
                The issuing wallet withdrew this acknowledgment on{' '}
                {new Date(r.withdrawnAt).toLocaleDateString('en-GB')}. This does not refund or erase
                the payment.
              </p>
            )}
            {r.evidenceUrl && (
              <p>
                <a
                  className="evidence-link"
                  href={r.evidenceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open supporting evidence <ExternalLinkIcon />
                </a>
                <br />
                <span className="small">External material supplied by the issuer.</span>
              </p>
            )}
            <p className="sample-foot">
              A signed statement records the issuer&rsquo;s assessment. It does not independently prove
              human identity, honest intent or contribution quality.
            </p>
          </article>
          <aside className="stack">
            <Card>
              <h2>Receipt status</h2>
              <div className="stack" style={{ gap: 'var(--space-4)' }}>
                <Badge
                  tone={r.withdrawnAt ? 'danger' : r.signatureVerifiedAt ? 'success' : 'pending'}
                >
                  {receiptLabel(r)}
                </Badge>
                <p className="small">
                  {r.publishedAt
                    ? 'Anyone with the link can inspect this receipt.'
                    : 'Only the issuer and contributor can inspect this receipt.'}
                </p>
                {issuer && r.paymentState === 'DRAFT' && (
                  <>
                    <p className="small">
                      Review the contributor&rsquo;s address below. Authorizing this direct payment will
                      send {formatLuna(r.amountLuna)} NIM plus any wallet fee.
                    </p>
                    <div className="actions" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                      <Button size="lg" disabled={busy} onClick={pay}>
                        {busy ? 'Opening wallet&hellip;' : 'Authorize payment in Nimiq Pay'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            await api(base + '/cancel', 'POST', {});
                          })
                        }
                      >
                        Cancel draft
                      </Button>
                    </div>
                  </>
                )}
                {issuer && ['AWAITING_WALLET', 'SUBMITTED'].includes(r.paymentState) && (
                  <>
                    <Notice tone="warning">
                      A payment was already requested. Use your wallet history to check it; do not
                      send again.
                    </Notice>
                    {r.transactionHash && (
                      <Button
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            await api(base + '/verify', 'POST', {});
                            setMessage(
                              'Matching payment confirmed. You can sign the acknowledgment.',
                            );
                          })
                        }
                      >
                        Check payment confirmation
                      </Button>
                    )}
                    {r.paymentState === 'AWAITING_WALLET' && (
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            const result = savedResult || sessionStorage.getItem(storageKey);
                            if (!result)
                              throw new Error(
                                'No saved result was found in this tab. Paste the existing transaction hash from wallet history below.',
                              );
                            await attach(result, r.paymentAttemptId);
                          })
                        }
                      >
                        Recover saved wallet result
                      </Button>
                    )}
                    <form onSubmit={reconcile}>
                      <Field
                        id="transaction-hash"
                        label="Existing transaction hash"
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        maxLength={64}
                        minLength={64}
                        required
                        hint="Paste the hash from wallet history. Only a payment matching this exact receipt can be accepted."
                      />
                      <Button variant="secondary" type="submit" disabled={busy}>
                        Reconcile existing payment
                      </Button>
                    </form>
                  </>
                )}
                {issuer && r.paymentState === 'CONFIRMED' && !r.signatureVerifiedAt && (
                  <>
                    <Notice>Payment is confirmed. The acknowledgment is still unsigned.</Notice>
                    <Button size="lg" disabled={busy} onClick={sign}>
                      {busy ? 'Checking signature&hellip;' : 'Sign acknowledgment in Nimiq Pay'}
                    </Button>
                  </>
                )}
                {recipient && r.signatureVerifiedAt && !r.withdrawnAt && !r.publishedAt && (
                  <>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      <span>
                        I agree to publish this statement, evidence link, wallet addresses and
                        payment reference.
                      </span>
                    </label>
                    <Button
                      size="lg"
                      disabled={busy || !consent}
                      onClick={() =>
                        action(async () => {
                          await api(base + '/publish', 'PATCH', { published: true, consent });
                          setMessage('This receipt is now public.');
                        })
                      }
                    >
                      Publish receipt
                    </Button>
                  </>
                )}
                {recipient && r.publishedAt && (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        await api(base + '/publish', 'PATCH', { published: false });
                        setConsent(false);
                        setMessage(
                          'The receipt is private again. Copies already shared elsewhere cannot be recalled.',
                        );
                      })
                    }
                  >
                    Make private
                  </Button>
                )}
                {r.publishedAt && <ShareButton path={'/receipts/' + id} />}
                <Button variant="ghost" onClick={download}>
                  Download receipt JSON
                </Button>
                {issuer && r.signatureVerifiedAt && !r.withdrawnAt && (
                  <Button
                    variant="danger"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          'Withdraw your acknowledgment? The receipt will retain its history and payment. This does not send a refund.',
                        )
                      )
                        action(async () => {
                          await api(base + '/withdraw', 'POST', {});
                        });
                    }}
                  >
                    Withdraw acknowledgment
                  </Button>
                )}
                {!wallet.data?.session && (
                  <>
                    <p className="small">
                      If this is your receipt, connect your wallet to manage it.
                    </p>
                    <Button variant="secondary" disabled={wallet.busy} onClick={wallet.signIn}>
                      Connect wallet
                    </Button>
                    {wallet.error && <Notice tone="error">{wallet.error}</Notice>}
                  </>
                )}
                <ActionLink href="/app" variant="ghost">
                  Back to workspace
                </ActionLink>
              </div>
            </Card>
            <Card>
              <h2>Inspect the evidence</h2>
              <dl className="detail-list">
                <div>
                  <dt>Issuing wallet</dt>
                  <dd className="mono">{r.issuerAddress}</dd>
                </div>
                <div>
                  <dt>Contributor wallet</dt>
                  <dd className="mono">{r.recipientAddress}</dd>
                </div>
                <div>
                  <dt>Transaction hash</dt>
                  <dd className="mono">{r.transactionHash || 'No transaction attached'}</dd>
                </div>
                <div>
                  <dt>Payment check</dt>
                  <dd>
                    {r.paymentVerifiedAt
                      ? new Date(r.paymentVerifiedAt).toISOString()
                      : 'Not confirmed'}
                  </dd>
                </div>
                <div>
                  <dt>Confirmations observed</dt>
                  <dd>{r.confirmationCount ?? 'Not checked'}</dd>
                </div>
                <div>
                  <dt>Verification policy</dt>
                  <dd>{r.verificationPolicy || 'Not applied'}</dd>
                </div>
                <div>
                  <dt>Signature check</dt>
                  <dd>
                    {r.signatureVerifiedAt
                      ? new Date(r.signatureVerifiedAt).toISOString()
                      : 'Not signed'}
                  </dd>
                </div>
              </dl>
              <p className="small">
                These are checks observed at the stated time. The hosted application stores this
                record; it does not guarantee permanent availability or irreversible chain finality.
              </p>
              {r.acknowledgmentMessage && (
                <details>
                  <summary>Exact signed statement and signature</summary>
                  <pre className="code-block">{r.acknowledgmentMessage}</pre>
                  <p className="small mono" style={{ overflowWrap: 'anywhere' }}>
                    Public key: {r.acknowledgmentPublicKey || 'Awaiting signature'}
                    <br />
                    Signature: {r.acknowledgmentSignature || 'Awaiting signature'}
                  </p>
                </details>
              )}
            </Card>
          </aside>
        </div>
      )}
    </PageShell>
  );
}