'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNimiqWallet } from '@/hooks/useNimiqWallet'
import { useIdentity, useSearch } from '@/hooks/useIdentity'
import { formatNimAddress } from '@/lib/nimiq'

export default function Home() {
  const { account, isConnecting, isAvailable, error: walletError, connect, isConnected } = useNimiqWallet()
  const { identity, isLoading: identityLoading, error: identityError, claimIdentity, checkAvailability } = useIdentity()
  const { results: searchResults, isLoading: searchLoading, search } = useSearch()
  
  const [handle, setHandle] = useState('')
  const [handleAvailable, setHandleAvailable] = useState<null | boolean>(null)
  const [checkingHandle, setCheckingHandle] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (identity) {
      setShowProfile(true)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }, [identity])

  const checkAvailabilityDebounced = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setHandleAvailable(null)
      return
    }
    
    setCheckingHandle(true)
    try {
      const available = await checkAvailability(value)
      setHandleAvailable(available)
    } catch {
      setHandleAvailable(false)
    } finally {
      setCheckingHandle(false)
    }
  }, [checkAvailability])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setHandle(value)
    setHandleAvailable(null)
    
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    if (value.length >= 2) {
      search(value)
      debounceRef.current = setTimeout(() => checkAvailabilityDebounced(value), 300)
    } else {
      search('')
    }
  }

  const handleClaim = async () => {
    if (!account || !handle || handleAvailable !== true) return
    
    setClaiming(true)
    setClaimError(null)
    
    try {
      await claimIdentity(handle, account.address)
      setShowProfile(true)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Failed to claim identity')
    } finally {
      setClaiming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && handleAvailable === true && !claiming) {
      handleClaim()
    }
  }

  if (!isAvailable) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-6xl font-mono font-bold text-primary mb-4">.neet</div>
          <h1 className="text-3xl font-bold mb-4">Open in Nimiq Pay</h1>
          <p className="text-muted-foreground mb-8">
            This Mini App only works inside Nimiq Pay. Please open it from the Nimiq Pay app to use .neet.
          </p>
          <div className="glass p-4 text-left text-sm font-mono text-muted-foreground rounded-xl">
            <p>Nimiq Pay provides the wallet environment</p>
            <p className="mt-1">Mini Apps access wallet through injected provider</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
        <div className="text-center max-w-md w-full animate-slide-up">
          <div className="text-6xl font-mono font-bold text-primary mb-4">.neet</div>
          <h1 className="text-3xl font-bold mb-4">Your identity on Nimiq</h1>
          <p className="text-muted-foreground mb-8">
            Claim your human-readable identity. Build portable reputation through real wallet activity, payments, and endorsements.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="btn btn-primary w-full max-w-xs"
          >
            {isConnecting ? 'Connecting...' : 'Connect Nimiq Wallet'}
          </button>
          {walletError && (
            <p className="text-destructive mt-4 text-sm">{walletError}</p>
          )}
        </div>
      </div>
    )
  }

  if (showProfile && identity) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ProfileView identity={identity} account={account} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 px-4 py-4 glass sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-mono font-bold text-primary">.neet</div>
          {account && (
            <div className="flex items-center gap-3 text-sm">
              <span className="badge badge-primary font-mono text-xs">
                {account.network.toUpperCase()}
              </span>
              <span className="font-mono text-muted-foreground">{formatNimAddress(account.address)}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">Claim your <span className="text-gradient">.neet</span> identity</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your wallet address becomes a human-readable name. Build reputation through real activity.
          </p>
        </div>

        <div className="glass-strong p-6 md:p-8 rounded-2xl space-y-8 animate-slide-up">
          <div>
            <label className="block text-sm font-medium mb-2">Choose your handle</label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={handle}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="james"
                  className="input flex-1 font-mono text-lg pr-16"
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                />
                <span className="flex items-center text-muted-foreground font-mono text-lg px-4 glass border-l-0 rounded-r-xl">
                  .neet
                </span>
              </div>
              {handle.length >= 3 && handleAvailable === true && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2">
                  <span className="badge badge-success animate-scale-in">✓ Available</span>
                </div>
              )}
            </div>
            {handle.length >= 3 && (
              <div className="flex items-center gap-3 mt-3">
                {checkingHandle ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Checking...
                  </span>
                ) : handleAvailable === true ? (
                  <>
                    <span className="badge badge-success">✓ Available</span>
                    <button
                      onClick={handleClaim}
                      disabled={claiming}
                      className="btn btn-primary ml-auto"
                    >
                      {claiming ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Claiming...
                        </>
                      ) : 'Claim'}
                    </button>
                  </>
                ) : handleAvailable === false ? (
                  <span className="badge badge-warning">Already taken</span>
                ) : null}
              </div>
            )}
            {handle.length > 0 && handle.length < 3 && (
              <p className="text-destructive text-sm mt-2">Handle must be at least 3 characters</p>
            )}
            {claimError && (
              <p className="text-destructive text-sm mt-2 animate-shake">{claimError}</p>
            )}
          </div>

          <div className="pt-6 border-t border-border/50">
            <h3 className="text-lg font-medium mb-4">Search existing identities</h3>
            {searchLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide glass-hover">
                {searchResults.map((result) => (
                  <button
                    key={result.fullHandle}
                    onClick={() => {
                      setHandle(result.handle)
                      inputRef.current?.focus()
                    }}
                    className="w-full text-left p-3 glass rounded-xl hover:bg-glass-hover transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium">{result.fullHandle}</span>
                      <span className="text-xs text-primary font-medium">Rep: {result.reputation}</span>
                    </div>
                    {result.profile?.displayName && (
                      <p className="text-sm text-muted-foreground mt-1">{result.profile.displayName}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : handle.length >= 2 ? (
              <p className="text-muted-foreground/50 text-center py-4">No identities found</p>
            ) : null}
          </div>
        </div>

        {showSuccess && (
          <div className="fixed bottom-6 right-6 glass-strong p-4 rounded-xl animate-slide-up shadow-glow-lg z-50">
            <div className="flex items-center gap-2 text-primary">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Identity claimed successfully!</span>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground/50">
          <p>Your identity. Your reputation. Portable across the Nimiq ecosystem.</p>
        </div>
      </main>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}

function ProfileView({ identity, account }: { 
  identity: ReturnType<typeof useIdentity>['identity'] & { profile?: any; stats?: any }
  account: any | null
}) {
  const reputation = identity.reputation || 0
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 px-4 py-4 glass sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-mono font-bold text-primary">.neet</div>
          {account && (
            <div className="flex items-center gap-3 text-sm">
              <span className="badge badge-primary font-mono text-xs">
                {account.network.toUpperCase()}
              </span>
              <span className="font-mono text-muted-foreground">{formatNimAddress(account.address)}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-strong p-6 md:p-8 rounded-2xl mb-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="avatar-lg font-mono relative">
              {identity.profile?.avatarUrl ? (
                <img src={identity.profile.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                identity.handle.charAt(0).toUpperCase()
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold font-mono">
                  {identity.fullHandle}
                </h1>
                <span className="badge badge-primary">Verified Wallet</span>
              </div>
              {identity.profile?.displayName && (
                <p className="text-xl text-foreground mt-1">{identity.profile.displayName}</p>
              )}
              {identity.profile?.bio && (
                <p className="text-muted-foreground mt-2">{identity.profile.bio}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold text-primary">{reputation}</div>
              <div className="text-xs text-muted-foreground">Reputation</div>
            </div>
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold">{identity.stats?.posts || 0}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold text-primary">
                {identity.stats?.nimReceived?.toFixed(5) || '0'} NIM
              </div>
              <div className="text-xs text-muted-foreground">Received</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-strong p-6 rounded-2xl animate-slide-up">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <button className="btn btn-primary">Edit Profile</button>
              <button className="btn btn-secondary">Create Post</button>
              <button className="btn btn-ghost">Share Profile</button>
            </div>
          </div>

          <div className="glass-strong p-6 rounded-2xl animate-slide-up">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <p className="text-muted-foreground/50 text-sm">Activity feed coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  )
}