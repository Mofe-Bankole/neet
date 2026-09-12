'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { api, type Receipt } from '@/lib/client';
import { lunaFromDecimal, formatLuna } from '@/lib/domain';
import { PageShell, PageIntro, Button, Notice } from './system';
import { Field, TextField, SessionGate, NetworkBanner } from './forms';

export default function AcknowledgeForm({ recipient = '' }: { recipient?: string }) {
  const wallet = useSession(),
    router = useRouter(),
    [to, setTo] = useState(recipient),
    [amount, setAmount] = useState(''),
    [statement, setStatement] = useState(''),
    [evidence, setEvidence] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [key, setKey] = useState('');

  let formatted = '&mdash;';
  try {
    formatted = formatLuna(lunaFromDecimal(amount)) + ' NIM';
  } catch {}

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const requestKey =
      key ||
      crypto.randomUUID?.() ||
      Array.from(crypto.getRandomValues(new Uint8Array(16)), (v) =>
        v.toString(16).padStart(2, '0'),
      ).join('');
    setKey(requestKey);
    try {
      const result = await api<{ receipt: Receipt }>('/api/receipts', 'POST', {
        recipientHandle: to,
        amountNim: amount,
        statement,
        evidenceUrl: evidence,
        idempotencyKey: requestKey,
      });
      router.push('/receipts/' + result.receipt.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this draft.');
    } finally {
      setBusy(false);
    }
  }

  function edit() {
    setKey('');
    setError('');
  }

  return (
    <PageShell>
      {wallet.data && <NetworkBanner network={wallet.data.network} />}
      <PageIntro eyebrow="Acknowledge a contribution" title="Make your thank-you count.">
        Describe the help, choose an amount, then review everything before opening your wallet.
      </PageIntro>
      <SessionGate wallet={wallet} requireProfile>
        <div className="two-column">
          <form className="panel" onSubmit={submit}>
            {error && <Notice tone="error">{error}</Notice>}
            <Field
              id="recipient"
              label="Contributor&rsquo;s .neet name"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                edit();
              }}
              required
              placeholder="ada.neet"
              hint="The contributor must already have a name on this network."
            />
            <Field
              id="amount"
              label="Amount in NIM"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                edit();
              }}
              inputMode="decimal"
              required
              placeholder="50.00"
              hint="Up to 5 decimal places. Your wallet will show any network fee."
            />
            <TextField
              id="contribution"
              label="What did they contribute?"
              minLength={10}
              maxLength={600}
              value={statement}
              onChange={(e) => {
                setStatement(e.target.value);
                edit();
              }}
              required
              placeholder="Tested the mobile flow and documented three issues before our release."
              hint="Your wallet will sign this exact description after payment is confirmed."
              characterLimit={600}
            />
            <Field
              id="evidence"
              label="Evidence link (optional)"
              type="url"
              value={evidence}
              onChange={(e) => {
                setEvidence(e.target.value);
                edit();
              }}
              placeholder="https://&hellip;"
              maxLength={1000}
              hint="Link to an issue, document or contribution. Check that it contains no private information."
            />
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? 'Saving draft&hellip;' : 'Review contribution'}
            </Button>
          </form>
          <aside className="panel">
            <h2>Two approvals. One record.</h2>
            <ol className="progress-list">
              <li>Review the amount and recipient.</li>
              <li>Authorize the payment in Nimiq Pay.</li>
              <li>Wait for an independent payment check.</li>
              <li>Sign your acknowledgment.</li>
              <li>The contributor decides whether to publish.</li>
            </ol>
            <div className="form-summary">
              <div>
                <span>To</span>
                <strong>{to || 'Choose a contributor'}</strong>
              </div>
              <div>
                <span>Amount</span>
                <strong>{formatted}</strong>
              </div>
            </div>
            <p className="small">
              Saving a draft does not send funds. This is a direct payment, with no escrow or refund
              service.
            </p>
          </aside>
        </div>
      </SessionGate>
    </PageShell>
  );
}