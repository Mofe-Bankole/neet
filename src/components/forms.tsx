'use client';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { Button, Notice, ActionLink } from './system';
import type { WalletSession } from '@/hooks/useSession';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  affix?: string;
  affixPosition?: 'prefix' | 'suffix';
}

export function Field({
  id,
  label,
  hint,
  error,
  affix,
  affixPosition = 'suffix',
  className = '',
  ...props
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {affix && affixPosition === 'prefix' && (
        <div className="input-affix">
          <span aria-hidden="true">{affix}</span>
          <input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            {...props}
          />
        </div>
      )}
      {affix && affixPosition === 'suffix' && (
        <div className="input-affix">
          <input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            {...props}
          />
          <span aria-hidden="true">{affix}</span>
        </div>
      )}
      {!affix && (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          {...props}
        />
      )}
      {hint && !error && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export interface TextFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  characterLimit?: number;
}

export function TextField({
  id,
  label,
  hint,
  error,
  characterLimit,
  className = '',
  ...props
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const [length, setLength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    if (props.onChange) props.onChange(e);
  };

  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        onChange={handleChange}
        {...props}
      />
      {hint && !error && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {characterLimit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
          <span className="caption" style={{ color: length > characterLimit ? 'var(--status-danger-text)' : 'var(--text-tertiary)' }}>
            {length} / {characterLimit}
          </span>
        </div>
      )}
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export interface HandleInputProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  checking?: boolean;
  available?: boolean;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function HandleInput({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  checking = false,
  available,
  className = '',
  ...props
}: HandleInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const normalizedValue = value.toLowerCase().replace(/^\.?neet\.?/, '').replace(/[^a-z0-9-]/g, '');

  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-affix">
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          value={normalizedValue}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...props}
        />
        <span aria-hidden="true" style={{ color: 'var(--text-tertiary)' }}>.neet</span>
      </div>
      {checking && (
        <span className="field-hint" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="loading-bar" style={{ width: '60px', height: '4px' }} />
          Checking availability…
        </span>
      )}
      {available !== undefined && !checking && !error && (
        <span className="field-hint" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: available ? 'var(--status-success-text)' : 'var(--status-danger-text)',
            flexShrink: 0,
          }} />
          {available ? 'Available' : 'Already taken'}
        </span>
      )}
      {hint && !checking && available === undefined && !error && (
        <span id={hintId} className="field-hint">{hint}</span>
      )}
      {error && (
        <span id={errorId} className="field-error" role="alert">{error}</span>
      )}
    </div>
  );
}

export function NetworkBanner({ network }: { network: string }) {
  const isTestnet = network === 'testnet';
  return (
    <div className="network-banner" role="status" aria-live="polite">
      {isTestnet ? (
        <>
          <span className="badge badge-pending" style={{ marginRight: 'var(--space-2)' }}>TESTNET</span>
          Test NIM has no monetary value. The payment must match this network.
        </>
      ) : (
        <>
          <span className="badge badge-info" style={{ marginRight: 'var(--space-2)' }}>MAINNET</span>
          Payments use real NIM. The payment must match this network.
        </>
      )}
    </div>
  );
}

export interface SessionGateProps {
  wallet: WalletSession;
  children: ReactNode;
  requireProfile?: boolean;
}

export function SessionGate({
  wallet,
  children,
  requireProfile = false,
}: SessionGateProps) {
  if (!wallet.data) {
    return (
      <div className="stack">
        <Notice>{wallet.error || 'Loading your session…'}</Notice>
        <Button variant="secondary" onClick={() => wallet.refresh().catch(() => {})}>
          Try again
        </Button>
      </div>
    );
  }

  if (!wallet.data.session) {
    return (
      <div className="panel narrow">
        <h2>A name starts with your wallet.</h2>
        <p>
          Sign a short ownership challenge inside Nimiq Pay. Signing in does not send funds.
          Returning wallets recover their existing profile.
        </p>
        {!wallet.data.configured && (
          <Notice tone="warning">
            The database is not configured. The sample remains available.
          </Notice>
        )}
        <div className="stack">
          {wallet.error && <Notice tone="error">{wallet.error}</Notice>}
          <Button disabled={wallet.busy || !wallet.data.configured} onClick={wallet.signIn}>
            {wallet.busy ? 'Waiting for your wallet…' : 'Connect and verify wallet'}
          </Button>
          <ActionLink href="/preview" variant="secondary">
            Explore without a wallet
          </ActionLink>
          <p className="small">
            In Nimiq Pay, open the configured Mini App URL. For a local build, follow the included
            setup guide. Dotneet never asks for your private key.
          </p>
        </div>
      </div>
    );
  }

  if (requireProfile && !wallet.data.profile) {
    return (
      <div className="panel narrow">
        <h2>Claim your name first.</h2>
        <p>Your wallet is connected. Add a .neet name before acknowledging a contributor.</p>
        <ActionLink href="/app">Choose your .neet name</ActionLink>
      </div>
    );
  }

  return <>{children}</>;
}

export function ShareButton({ path, label = 'Copy link' }: { path: string; label?: string }) {
  const [message, setMessage] = useState('');
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          const url = new URL(path, window.location.origin).href;
          try {
            await navigator.clipboard.writeText(url);
            setMessage('Link copied.');
          } catch {
            setMessage('Copy this link: ' + url);
          }
        }}
      >
        {label}
      </Button>
      {message && (
        <p className="small" role="status" style={{ overflowWrap: 'anywhere' }}>
          {message}
        </p>
      )}
    </>
  );
}

export interface ToastProps {
  message: string;
  tone?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function Toast({ message, tone = 'success', onClose }: ToastProps) {
  const toneClasses = {
    success: 'notice-success',
    error: 'notice-error',
    warning: 'notice-warning',
    info: 'notice-info',
  };

  return (
    <div
      className={`notice ${toneClasses[tone]} animate-slide-in`}
      role={tone === 'error' ? 'alert' : 'status'}
      style={{ position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)', zIndex: 600, maxWidth: '400px', boxShadow: 'var(--shadow-xl)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>{message}</div>
        <button
          type="button"
          onClick={onClose}
          className="button-ghost button-small"
          style={{ padding: 'var(--space-1)', lineHeight: 1 }}
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute ${positions[position]} px-3 py-2 text-xs text-on-action bg-text-primary rounded-md shadow-lg whitespace-nowrap z-50 animate-fade-in`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}