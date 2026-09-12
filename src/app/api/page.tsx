import { PageShell, PageIntro, Notice } from '@/components/system';
export default function Page() {
  return (
    <PageShell>
      <PageIntro eyebrow="Developer reference · v1" title="Read the record.">
        A small public API for permitted profiles and contribution receipts.
      </PageIntro>
      <Notice>
        Public responses include only published, complete receipts. Private or unavailable receipts
        return 404. No universal reputation score is provided.
      </Notice>
      <section className="spec-section">
        <h2>Public endpoints</h2>
        <dl className="detail-list">
          <div>
            <dt>Profile and latest public receipts</dt>
            <dd className="mono">GET /api/v1/profiles/:handle</dd>
          </div>
          <div>
            <dt>Single published receipt</dt>
            <dd className="mono">GET /api/v1/receipts/:id</dd>
          </div>
          <div>
            <dt>Name availability on this deployment’s network</dt>
            <dd className="mono">GET /api/v1/handles/:handle</dd>
          </div>
        </dl>
        <p>
          Amounts are integer luna strings: 100,000 luna = 1 NIM. Responses carry a network field.
          Dates use ISO 8601. The profile response is capped at 50 latest public receipts, including
          historical withdrawals.
        </p>
        <pre className="code-block">
          {
            'const response = await fetch(appOrigin + "/api/v1/profiles/" + encodeURIComponent(handle));\nconst data = await response.json();\nif (!response.ok) throw new Error(data.error?.message || "Request failed");\nfor (const receipt of data.receipts) {\n  // Inspect provenance, network and withdrawal status.\n  console.log(receipt.statement, receipt.amountLuna);\n}'
          }
        </pre>
        <p>
          Public reads support cross-origin GET and OPTIONS without credentials. Authenticated
          writes require a same-origin wallet session. A successful response describes checks stored
          by Dotneet, not proof of contribution quality.
        </p>
        <p className="small">
          See the included Data and API specification for complete contracts, error codes,
          authentication and the payment lifecycle. External integration code is provided in
          examples/.
        </p>
      </section>
    </PageShell>
  );
}
