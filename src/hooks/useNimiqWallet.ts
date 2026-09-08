'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  isNimiqPayAvailable, 
  connectNimiqWallet, 
  getNimiqAccount,
  onAccountChange,
  onNetworkChange,
  NimiqWalletInfo
} from '@/lib/nimiq'

export function useNimiqWallet() {
  const [account, setAccount] = useState<NimiqWalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    const available = isNimiqPayAvailable()
    setIsAvailable(available)

    if (available) {
      getNimiqAccount().then(setAccount).catch(console.error)
      
      const unsubscribeAccount = onAccountChange((newAccount) => {
        setAccount(newAccount)
      })

      const unsubscribeNetwork = onNetworkChange((network) => {
        console.log('Network changed:', network)
      })

      return () => {
        unsubscribeAccount()
        unsubscribeNetwork()
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (!isAvailable) {
      setError('Nimiq Pay not available. Please open this app inside Nimiq Pay.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const newAccount = await connectNimiqWallet()
      setAccount(newAccount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [isAvailable])

  const disconnect = useCallback(() => {
    setAccount(null)
  }, [])

  return {
    account,
    isConnecting,
    isAvailable,
    error,
    connect,
    disconnect,
    isConnected: !!account,
  }
}