import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function ArrowIcon({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      {...props}
    >
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className = 'proof-icon', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      {...props}
    >
      <circle cx="10" cy="10" r="8" />
      <path d="m6 10 2.5 2.5L14 7" />
    </svg>
  );
}

export function CloseIcon({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'button-small',
    md: 'button-md',
    lg: 'button-lg',
    xl: 'button-xl',
  };

  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    ghost: 'button-ghost',
    danger: 'button-danger',
  };

  const classNames = [
    'button',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    loading ? 'button-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {children}
    </button>
  );
}

export interface ActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  className?: string;
}

export function ActionLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ActionLinkProps) {
  const sizeClasses = {
    sm: 'button-small',
    md: 'button-md',
    lg: 'button-lg',
    xl: 'button-xl',
  };

  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    ghost: 'button-ghost',
  };

  const classNames = [
    'button',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Link className={classNames} href={href} {...props}>
      {children}
    </Link>
  );
}

export interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'pending' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  tone = 'neutral',
  size = 'md',
}: BadgeProps) {
  const toneClasses = {
    neutral: 'badge-neutral',
    success: 'badge-success',
    pending: 'badge-pending',
    danger: 'badge-danger',
    info: 'badge-info',
  };

  const sizeStyles = {
    sm: { fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' },
    md: { fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' },
  };

  return (
    <span
      className={`badge ${toneClasses[tone]}`}
      style={sizeStyles[size]}
    >
      {children}
    </span>
  );
}

export interface NoticeProps {
  children: ReactNode;
  tone?: 'neutral' | 'error' | 'warning' | 'success' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Notice({
  children,
  tone = 'neutral',
  title,
  dismissible = false,
  onDismiss,
}: NoticeProps) {
  const toneClasses = {
    neutral: 'notice',
    error: 'notice-error',
    warning: 'notice-warning',
    success: 'notice-success',
    info: 'notice-info',
  };

  const role = tone === 'error' ? 'alert' : 'status';

  return (
    <div role={role} className={toneClasses[tone]}>
      {title && <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{title}</div>}
      {typeof children === 'string' ? <p>{children}</p> : children}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="button-ghost button-small"
          style={{ marginTop: 'var(--space-2)' }}
          aria-label="Dismiss"
        >
          <CloseIcon width="14" height="14" />
        </button>
      )}
    </div>
  );
}

export interface HeaderProps {
  active?: string;
}

export function Header({ active }: HeaderProps) {
  return (
    <header className="site-header" role="banner">
      <Link href="/" className="wordmark" aria-label="Dotneet home">
        <span>.</span>neet
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <Link
          href="/#how-it-works"
          className="nav-secondary"
        >
          How it works
        </Link>
        <Link
          href="/preview"
          aria-current={active === 'preview' ? 'page' : undefined}
        >
          <span className="nav-long">Explore a sample</span>
          <span className="nav-short">Sample</span>
        </Link>
        <Link
          href="/design-system"
          className="nav-secondary"
          aria-current={active === 'design' ? 'page' : undefined}
        >
          Design system
        </Link>
        <ActionLink href="/app" size="sm">
          Your .neet <ArrowIcon />
        </ActionLink>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div>Built for the people building on Nimiq.</div>
      <div className="links">
        <Link href="/api">Developer reference</Link>
        <a href="https://github.com/Mofe-Bankole/neet" target="_blank" rel="noreferrer">
          Original source
        </a>
        <Link href="/design-system">Design system</Link>
      </div>
    </footer>
  );
}

export interface PageShellProps {
  children: ReactNode;
  active?: string;
}

export function PageShell({ children, active }: PageShellProps) {
  return (
    <>
      <Header active={active} />
      <main id="main" className="container page-wrap">
        {children}
      </main>
      <Footer />
    </>
  );
}

export interface PageIntroProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageIntro({ eyebrow, title, children }: PageIntroProps) {
  return (
    <div className="page-intro">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}

export interface SampleReceiptProps {
  compact?: boolean;
}

export function SampleReceipt({ compact = false }: SampleReceiptProps) {
  return (
    <article className="receipt-paper" aria-label="Illustrative contribution receipt">
      <div className="paper-top">
        <span className="paper-brand">.neet</span>
        <span className="paper-sample">ILLUSTRATIVE SAMPLE</span>
      </div>
      <div className="eyebrow">A contribution worth keeping</div>
      <h2 className="paper-handle">
        ada<span style={{ color: 'var(--text-paper-tertiary)' }}>.neet</span>
      </h2>
      <p>Mobile testing that made the next release better.</p>
      <dl className="paper-details">
        <div>
          <dt>Acknowledged by</dt>
          <dd>mika.neet · example builder</dd>
        </div>
        <div>
          <dt>Contribution</dt>
          <dd>Mobile usability testing</dd>
        </div>
      </dl>
      <hr className="paper-rule" />
      <div className="paper-amount">
        50.00 <span style={{ fontSize: 'var(--text-xl)' }}>NIM</span>
      </div>
      <p className="small">Example amount · no funds were sent</p>
      {!compact && (
        <>
          <hr className="paper-rule" />
          <div className="proof-row">
            <CheckIcon />
            <span>A signed acknowledgment identifies its issuer.</span>
          </div>
          <div className="proof-row">
            <CheckIcon />
            <span>A separate check confirms a matching payment.</span>
          </div>
        </>
      )}
      <p className="sample-foot">Fictional example. No signature or payment has been verified.</p>
    </article>
  );
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover ? 'hover:border-control-hover hover:shadow-md transition-all duration-120' : '';

  return (
    <article
      className={`panel ${paddingClasses[padding]} ${hoverClass} ${className}`}
    >
      {children}
    </article>
  );
}

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-border-subtle ${className}`} />;
  }
  return <hr className={`border-border-subtle ${className}`} />;
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ width = '100%', height = '1rem', className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-border-control ${rounded ? 'rounded-md' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}

export interface SeparatorProps {
  className?: string;
  text?: string;
}

export function Separator({ className = '', text }: SeparatorProps) {
  if (text) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 border-t border-border-subtle" />
        <span className="text-caption text-tertiary uppercase tracking-wider">{text}</span>
        <div className="flex-1 border-t border-border-subtle" />
      </div>
    );
  }
  return <hr className={`border-border-subtle ${className}`} />;
}