import { Header, Footer, ActionLink, ArrowIcon, SampleReceipt, Badge } from '@/components/system';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main" className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <div className="eyebrow eyebrow-accent">For Nimiq builders & contributors</div>
            <h1 id="hero-title">
              Get paid.
              <br />
              <span className="accent">Keep the proof.</span>
            </h1>
            <p className="hero-description">
              Your useful work deserves more than a thank-you lost in a chat. Get paid in NIM and
              keep an acknowledgment under your own .neet name.
            </p>
            <div className="actions">
              <ActionLink href="/app" size="lg">
                Make a name for your work <ArrowIcon />
              </ActionLink>
              <ActionLink href="/preview" variant="secondary" size="lg">
                Explore a sample
              </ActionLink>
            </div>
            <p className="hero-note">A name people remember. A contribution they can inspect.</p>
          </div>
          <div className="receipt-stack">
            <SampleReceipt />
          </div>
        </section>

        <div className="principles" role="list" aria-label="Core principles">
          <div className="principle" role="listitem">
            <span className="mono accent">01</span>
            <p>
              <strong>Your keys stay with you</strong>
              Approve actions inside Nimiq Pay. Dotneet never sees your private key.
            </p>
          </div>
          <div className="principle" role="listitem">
            <span className="mono accent">02</span>
            <p>
              <strong>Evidence you can open</strong>
              See who said what, which payment was checked, and when. No trust scores.
            </p>
          </div>
          <div className="principle" role="listitem">
            <span className="mono accent">03</span>
            <p>
              <strong>Recognition that travels</strong>
              Share your work beyond the original chat. Your profile is a portable record.
            </p>
          </div>
        </div>

        <section id="how-it-works" className="section" aria-labelledby="how-heading">
          <div className="section-heading">
            <h2 id="how-heading">
              Good work.
              <br />A lasting record.
            </h2>
            <p>
              For the testers, translators, designers and helpful people making Mini Apps better.
            </p>
          </div>
          <div className="steps" role="list">
            {[
              [
                '01',
                'Start with your name.',
                'Claim a memorable .neet name with a wallet you control. Your profile becomes a home for your contributions.',
              ],
              [
                '02',
                'Pay and acknowledge.',
                'A builder pays in NIM and signs a description of your help. An issue, document or other link adds context.',
              ],
              [
                '03',
                'Take your work with you.',
                'Choose which receipts to publish. Share your profile when the next opportunity comes along.',
              ],
            ].map(([number, title, text]) => (
              <article className="step" key={number} role="listitem">
                <div className="step-number">{number} /</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="statement" aria-labelledby="statement-heading">
          <h3 id="statement-heading">
            Clear evidence.
            <br />
            Room for your judgment.
          </h3>
          <p>
            A signature identifies the wallet that made an acknowledgment. A payment check confirms
            a transaction. You can inspect both, while deciding for yourself what a contribution
            means. Dotneet does not assign people a trust score.
          </p>
        </section>

        <section className="section" aria-labelledby="cta-heading">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 id="cta-heading" style={{ marginBottom: 'var(--space-4)' }}>
              Ready to put your work on record?
            </h2>
            <p style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-lg)' }}>
              Claim your .neet name and start collecting verifiable acknowledgments.
            </p>
            <div className="actions" style={{ justifyContent: 'center' }}>
              <ActionLink href="/app" size="lg">
                Get started <ArrowIcon />
              </ActionLink>
            </div>
            <p className="small" style={{ marginTop: 'var(--space-4)' }}>
              <Badge tone="info">Testnet only</Badge> No real funds · No production deployment
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}