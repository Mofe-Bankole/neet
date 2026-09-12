'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, type Profile } from '@/lib/client';
import { connectNimiqWallet, isNimiqPayAvailable, signMessage } from '@/lib/nimiq';
export interface SessionState {
  session: { address: string; network: string } | null;
  profile: Profile | null;
  network: string;
  configured: boolean;
}
export function useSession() {
  const [data, setData] = useState<SessionState | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    const next = await api<SessionState>('/api/auth/session');
    setData(next);
    return next;
  }, []);
  useEffect(() => {
    let active = true;
    api<SessionState>('/api/auth/session')
      .then((next) => {
        if (active) setData(next);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function signIn() {
    setBusy(true);
    setError('');
    try {
      const accounts = await connectNimiqWallet();
      if (!accounts.length)
        throw new Error('No wallet account was returned. Select an account in Nimiq Pay.');
      const challenge = await api<{ id: string; message: string }>('/api/auth/challenge', 'POST', {
        address: accounts[0],
      });
      const signature = await signMessage(challenge.message);
      await api('/api/auth/verify', 'POST', { id: challenge.id, ...signature });
      await refresh();
    } catch (e) {
      setError(
        !isNimiqPayAvailable()
          ? 'Open this application inside Nimiq Pay to connect a wallet. You can explore the sample in this browser.'
          : e instanceof Error
            ? e.message
            : 'Sign-in was not completed.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    setError('');
    try {
      await api('/api/auth/logout', 'POST', {});
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign out.');
    } finally {
      setBusy(false);
    }
  }
  return { data, error, busy, refresh, signIn, signOut };
}
export type WalletSession = ReturnType<typeof useSession>;
