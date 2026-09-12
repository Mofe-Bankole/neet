import Link from 'next/link';
import { Badge } from './system';
import { formatLuna } from '@/lib/domain';
import { receiptLabel, type Receipt } from '@/lib/client';

export function ReceiptCard({ receipt: r }: { receipt: Receipt }) {
  return (
    <article className="receipt-card">
      <div className="receipt-card-head">
        <span>
          {r.issuer?.handle || 'Issuer'}.neet &rarr; {r.recipient?.handle || 'Contributor'}.neet
        </span>
        <span className="mono">{formatLuna(r.amountLuna)} NIM</span>
      </div>
      <h3>
        <Link href={'/receipts/' + r.id}>{r.statement}</Link>
      </h3>
      <div className="receipt-card-foot">
        <Badge tone={r.withdrawnAt ? 'danger' : r.signatureVerifiedAt ? 'success' : 'pending'}>
          {receiptLabel(r)}
        </Badge>
        <Link className="text-link" href={'/receipts/' + r.id}>
          Inspect receipt &rarr;
        </Link>
      </div>
    </article>
  );
}