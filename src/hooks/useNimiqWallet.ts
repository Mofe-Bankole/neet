'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  isNimiqPayAvailable, 
  connectNimiqWallet, 
  getNimiqAccount,
  initializeNimiqProvider,
  NimiqWalletInfo
} from '@/lib/nimiq'

export function useNimiqWallet() {
  const [account, setAccount] = useState<NimiqWalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  
  const providerRef = useRef<{ 
    on: (event: string, callback: (...args: unknown[]) => void) => void
    off: (event: string, callback: (...args: unknown[]) => void) => void
  } | null>(null)

  useEffect(() => {
    const available = isNimiqPayAvailable()
    setIsAvailable(available)

    if (available) {
      getNimiqAccount().then(setAccount).catch(console.error)

      // Initialize provider and set up event listeners
      initializeNimiqProvider()
        .then((provider) => {
          providerRef.current = provider
          provider.on('accountChange', (newAccount: NimiqWalletInfo | null) => {
            setAccount(newAccount)
          })
          provider.on('networkChange', (network: string) => {
            console.log('Network changed:', network)
          })
        })
        .catch(console.error)

      return () => {
        if (providerRef.current) {
          providerRef.current.off('accountChange', () => {})
          providerRef.current.off('networkChange', () => {})
          providerRef.current = null
        }
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
      const accounts = await connectNimiqWallet()
      if (accounts.length > 0) {
        setAccount({ address: accounts[0], network: 'testnet' })
      }
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