import {
  PageShell,
  PageIntro,
  Button,
  Badge,
  Notice,
  SampleReceipt,
  ActionLink,
  Card,
} from '@/components/system';
import { Field, TextField } from '@/components/forms';

export default function Page() {
  return (
    <PageShell active="design">
      <PageIntro eyebrow="Dotneet design system · v1.1" title="One identity. Many formats.">
        A working reference for the product interface, presentation templates and future assets.
      </PageIntro>
      <div className="tabs">
        <a href="#foundations">Foundations</a>
        <a href="#components">Components</a>
        <a href="#formats">Cross-format</a>
      </div>
      <section id="foundations" className="spec-section">
        <h2>Calm structure. Clear evidence.</h2>
        <p>
          Dark surfaces give the work space. A paper receipt makes the record tangible. Lime marks
          the next action; status labels describe specific checks.
        </p>
        <div className="swatch-grid">
          {[
            ['Base', 'var(--surface-base)'],
            ['Panel', 'var(--surface-panel)'],
            ['Raised', 'var(--surface-raised)'],
            ['Action', 'var(--action-primary)'],
            ['Action hover', 'var(--action-primary-hover)'],
            ['Receipt paper', 'var(--surface-paper)'],
            ['Text primary', 'var(--text-primary)'],
            ['Text secondary', 'var(--text-secondary)'],
            ['Text tertiary', 'var(--text-tertiary)'],
            ['Control border', 'var(--border-control)'],
            ['Subtle border', 'var(--border-subtle)'],
            ['Success', 'var(--status-success-text)'],
            ['Pending', 'var(--status-pending-text)'],
            ['Danger', 'var(--status-danger-text)'],
            ['Info', 'var(--status-info-text)'],
            ['Focus (dark)', 'var(--focus-ring)'],
            ['Focus (paper)', 'var(--focus-ring-paper)'],
          ].map(([label, color]) => (
            <div className="swatch" key={label}>
              <div className="swatch-color" style={{ background: color }} />
              <div className="swatch-caption">
                {label}
                <br />
                <span className="mono">{color}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="two-column" style={{ marginTop: 'var(--space-9)' }}>
          <div>
            <div className="eyebrow">Inter / JetBrains Mono</div>
            <h2>
              Get paid.
              <br />
              <span className="accent">Keep the proof.</span>
            </h2>
            <p>
              Use direct verbs. Describe what was checked. Keep ownership, payments and contribution
              quality separate.
            </p>
          </div>
          <Card>
            <h3>Foundations in code</h3>
            <p className="small">
              Semantic CSS variables and portable JSON tokens are included in the handoff. Font
              stacks use variable fonts loaded via CDN with system fallbacks.
            </p>
            <div className="code-block">
{`// tokens.css
--surface-base: #0A0E16;
--action-primary: #CCF23F;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--radius-md: 8px;
--control-height-md: 44px;
--motion-fast: 120ms ease;`}
            </div>
            <p className="mono small" style={{ marginTop: 'var(--space-4)' }}>
              8px radius · 44px controls · 760px mobile breakpoint<br />
              Visible focus · Reduced motion · 4px base spacing
            </p>
          </Card>
        </div>
      </section>
      <section id="components" className="spec-section">
        <h2>Shared interface components</h2>
        <p>These are component specimens. Disabled examples do not perform application actions.</p>
        <div className="two-column">
          <div className="stack">
            <Card>
              <h3>Buttons</h3>
              <div className="actions" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <Button variant="primary" disabled>Primary</Button>
                <Button variant="secondary" disabled>Secondary</Button>
                <Button variant="ghost" disabled>Ghost</Button>
                <Button variant="danger" disabled>Danger</Button>
              </div>
              <div className="actions" style={{ marginTop: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="xl">XL</Button>
              </div>
              <div className="actions" style={{ marginTop: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </Card>
            <Card>
              <h3>Action Links</h3>
              <div className="actions" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <ActionLink href="/preview">Primary</ActionLink>
                <ActionLink href="/preview" variant="secondary">Secondary</ActionLink>
                <ActionLink href="/preview" variant="ghost">Ghost</ActionLink>
              </div>
            </Card>
            <Card>
              <h3>Badges</h3>
              <div className="stack" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <Badge tone="neutral">Neutral</Badge>
                <Badge tone="success">Success</Badge>
                <Badge tone="pending">Pending</Badge>
                <Badge tone="danger">Danger</Badge>
                <Badge tone="info">Info</Badge>
              </div>
              <div className="stack" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <Badge tone="success" size="sm">Small success</Badge>
                <Badge tone="pending" size="sm">Small pending</Badge>
              </div>
            </Card>
            <Card>
              <h3>Notices</h3>
              <div className="stack">
                <Notice tone="error" title="Error">This signature could not be verified. Start the signing request again.</Notice>
                <Notice tone="warning" title="Pending">Check the existing transaction. Do not resend payment.</Notice>
                <Notice tone="success" title="Success">Your profile changes were saved.</Notice>
                <Notice tone="info" title="Info">This is a testnet environment. No real funds are used.</Notice>
              </div>
            </Card>
            <Card>
              <h3>Inputs and consent</h3>
              <Field
                id="spec-name"
                label="Contributor&rsquo;s name"
                placeholder="ada.neet"
                hint="A label remains visible when the field has a value."
              />
              <TextField
                id="spec-description"
                label="Contribution description"
                placeholder="Describe the useful work."
                characterLimit={600}
              />
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Publication requires the contributor&rsquo;s explicit consent.</span>
              </label>
            </Card>
          </div>
          <div className="stack">
            <Card>
              <h3>Precise status labels</h3>
              <div className="stack" style={{ gap: 'var(--space-3)' }}>
                <Badge tone="success">Wallet control checked · specimen</Badge>
                <Badge tone="pending">Payment submitted · specimen</Badge>
                <Badge tone="success">Payment + acknowledgment checked · specimen</Badge>
                <Badge tone="danger">Acknowledgment withdrawn · specimen</Badge>
                <Badge tone="info">Testnet environment · specimen</Badge>
              </div>
              <p className="small" style={{ marginTop: 'var(--space-5)' }}>
                Do not use &ldquo;trusted person,&rdquo; &ldquo;verified human&rdquo; or a universal reputation score.
              </p>
            </Card>
            <Card>
              <h3>Receipt specimen</h3>
              <SampleReceipt compact />
            </Card>
            <Card>
              <h3>Form field states</h3>
              <div className="stack">
                <Field id="valid" label="Valid field" value="Correct input" hint="This field has valid input" />
                <Field id="error" label="Error field" value="Invalid input" error="This value is not accepted" />
                <Field
                  id="with-affix"
                  label="With affix"
                  placeholder="50.00"
                  affix="NIM"
                  affixPosition="suffix"
                  hint="Amount in NIM"
                />
              </div>
            </Card>
            <Card>
              <h3>Handle input</h3>
              <p className="small" style={{ marginBottom: 'var(--space-4)' }}>
                Normalizes to lowercase, strips .neet suffix, validates format.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Field
                    id="handle-available"
                    label="Available handle"
                    value="ada"
                    hint="Available"
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Field
                    id="handle-taken"
                    label="Taken handle"
                    value="mika"
                    error="This name is already claimed"
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Field
                    id="handle-checking"
                    label="Checking…"
                    value="test"
                    hint="Checking availability…"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      <section id="formats" className="spec-section">
        <h2>Designed beyond the website.</h2>
        <p>
          Presentation layouts use fewer words and larger type. Social graphics center one idea.
          Screenshots retain the network and sample labels.
        </p>
        <div className="asset-gallery">
          <div className="sample-slide">
            <div className="wordmark">
              <span>.</span>neet
            </div>
            <h3>
              Get paid.
              <br />
              <span className="accent">Keep the proof.</span>
            </h3>
            <p>Presentation title layout · 16:9</p>
          </div>
          <div className="sample-slide light">
            <div className="eyebrow">Evidence layout · illustrative</div>
            <h3>Open the record.</h3>
            <p>
              Show the issuer, the statement and the payment check. Add measured results only when
              they exist.
            </p>
          </div>
        </div>
<Card>
            <h3 style={{ marginTop: 'var(--space-6)' }}>Portable asset package</h3>
          <div className="actions" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <ActionLink href="/assets/templates/01-title-slide.svg" variant="secondary">
              Title slide SVG
            </ActionLink>
            <ActionLink href="/assets/templates/05-evidence-slide.svg" variant="secondary">
              Evidence slide SVG
            </ActionLink>
            <ActionLink href="/assets/templates/08-social-announcement.svg" variant="secondary">
              Social template SVG
            </ActionLink>
          </div>
          <p style={{ marginTop: 'var(--space-4)' }}>
            Included templates cover title, problem, solution, demo, evidence, roadmap and closing
            slides, plus social and video frames. SVG examples, source tokens and usage rules travel
            with the code and the Claude handoff.
          </p>
          <p className="small" style={{ marginTop: 'var(--space-3)' }}>
            Cross-format exports should preserve readable text, sample disclosures and accurate
            verification language. Dotneet is an independent product using Nimiq; these assets do
            not imply Nimiq endorsement.
          </p>
        </Card>
      </section>
    </PageShell>
  );
}