'use client';
import { useState } from 'react';
import { PageShell, PageIntro, Button, Notice, Badge, ActionLink, SampleReceipt, Card } from '@/components/system';
import { Field } from '@/components/forms';

export default function Preview() {
  const [page, setPage] = useState('Profile');
  const [state, setState] = useState('Complete');

  return (
    <PageShell active="preview">
      <PageIntro eyebrow="Interactive product sample" title="Follow a contribution.">
        Ada helps Mika test a Mini App. Explore how that work becomes a receipt.
      </PageIntro>
      <Notice tone="warning" title="Demo mode">
        Illustrative sample. Ada, Mika and the contribution are fictional. No wallet is connected,
        no funds are sent and no verification has occurred.
      </Notice>
      <div className="tabs" style={{ marginTop: 'var(--space-7)' }} aria-label="Sample pages">
        {['Profile', 'Payment flow', 'Receipt'].map((p) => (
          <button
            key={p}
            aria-current={page === p ? 'page' : undefined}
            onClick={() => setPage(p)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              color: page === p ? 'var(--text-primary)' : 'var(--text-tertiary)',
              border: 0,
              borderBottom: `2px solid ${page === p ? 'var(--action-primary)' : 'transparent'}`,
              background: 'transparent',
              fontSize: 'var(--text-base)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color var(--motion-fast), border-color var(--motion-fast)',
            }}
          >
            {p}
          </button>
        ))}
      </div>
      {page === 'Profile' ? (
        <>
          <section className="profile-hero">
            <div className="avatar-mark" aria-hidden="true">
              a
            </div>
            <div>
              <div className="eyebrow">Fictional contributor</div>
              <h2 className="profile-name">ada.neet</h2>
              <p>Ada · Mobile testing & documentation</p>
            </div>
            <div className="actions">
              <Button onClick={() => setPage('Payment flow')}>Explore acknowledgment</Button>
            </div>
          </section>
          <div className="profile-details">
            <aside>
              <Badge>Sample profile</Badge>
              <p style={{ marginTop: 'var(--space-5)' }}>
                I help make small apps easier to use, one clear bug report at a time.
              </p>
              <p className="small">
                The real profile shows a wallet address, claim date and only receipts the
                contributor chooses to publish.
              </p>
            </aside>
            <section>
              <div className="section-label">
                <h2>Published contributions</h2>
                <Badge>1 illustrative receipt</Badge>
              </div>
              <article className="receipt-card">
                <div className="receipt-card-head">
                  <span>mika.neet · fictional builder</span>
                  <span className="mono">50.00 NIM · example</span>
                </div>
                <h3>Mobile testing that made the next release better.</h3>
                <p>
                  Tested the contribution flow on a small screen and documented three navigation
                  issues.
                </p>
                <div className="receipt-card-foot">
                  <Badge tone="success">Example of a complete receipt</Badge>
                  <Button variant="ghost" onClick={() => setPage('Receipt')}>
                    Inspect sample →
                  </Button>
                </div>
              </article>
            </section>
          </div>
        </>
      ) : page === 'Payment flow' ? (
        <div className="two-column">
          <section className="panel">
            <div className="eyebrow">Example acknowledgment</div>
            <h2>Thanks for making it easier.</h2>
            <p>
              &ldquo;Tested our mobile contribution flow and documented three navigation issues before
              release.&rdquo;
            </p>
            <div className="form-summary">
              <div>
                <span>To</span>
                <strong>ada.neet · fictional</strong>
              </div>
              <div>
                <span>Example amount</span>
                <strong>50.00 NIM</strong>
              </div>
              <div>
                <span>Evidence</span>
                <strong>Issue report · illustrative</strong>
              </div>
            </div>
            <Notice>
              Real payments require an explicit wallet approval. After confirmation, the issuer
              signs the statement in a second approval.
            </Notice>
            <div className="actions" style={{ marginTop: 'var(--space-6)' }}>
              <Button
                onClick={() => {
                  setState('Pending');
                  setPage('Receipt');
                }}
              >
                Show pending example
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setState('Complete');
                  setPage('Receipt');
                }}
              >
                Show completed example
              </Button>
            </div>
          </section>
          <aside className="panel">
            <h2>What is being checked?</h2>
            <ol className="progress-list">
              <li>Which wallet authorized the payment.</li>
              <li>Whether its network, recipient, amount and receipt reference match.</li>
              <li>Whether the issuing wallet signed the exact acknowledgment.</li>
              <li>Whether the contributor agreed to publish it.</li>
            </ol>
            <p className="small">
              Contribution quality is the issuer&rsquo;s assessment. Wallets can collaborate or belong to
              the same person.
            </p>
          </aside>
        </div>
      ) : (
        <div className="receipt-layout">
          <SampleReceipt />
          <aside className="stack">
            <Card>
              <h2>Explore receipt states</h2>
              <Field
                id="sample-state"
                label="Illustrative state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <select id="sample-state" value={state} onChange={(e) => setState(e.target.value)}>
                  {[
                    'Complete',
                    'Pending',
                    'Unsigned',
                    'Private',
                    'Unavailable',
                    'Withdrawn',
                    'Cancelled',
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Notice
                tone={
                  state === 'Unavailable' ? 'error' : state === 'Pending' ? 'warning' : 'neutral'
                }
              >
                {
                  (
                    {
                      Complete:
                        'Example: payment and signature checks have completed. The contributor may publish.',
                      Pending:
                        'Example: payment is waiting for confirmation. Check again without sending another payment.',
                      Unsigned:
                        'Example: payment is confirmed, but the issuer still needs to sign the acknowledgment.',
                      Private:
                        'Example: the receipt is visible only to the issuer and contributor.',
                      Unavailable:
                        'Example: the verification service is unavailable. Payment remains unconfirmed in Dotneet. Do not resend.',
                      Withdrawn:
                        'Example: the issuer withdrew the acknowledgment. The historical payment remains; this is not a refund.',
                      Cancelled: 'Example: the draft was cancelled before payment was requested.',
                    } as Record<string, string>
                  )[state]
                }
              </Notice>
            </Card>
            <ActionLink href="/app" size="md">Try it with your wallet</ActionLink>
            <p className="small">
              Sample controls change only this page. They never call payment or verification
              services.
            </p>
          </aside>
        </div>
      )}
    </PageShell>
  );
}