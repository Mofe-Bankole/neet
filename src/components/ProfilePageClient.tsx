'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { useNimiqWallet } from '@/hooks/useNimiqWallet'
import { useEndorsements } from '@/hooks/useIdentity'
import { formatNimAddress, sendNimPayment } from '@/lib/nimiq'
import Link from 'next/link'

interface ProfileData {
  identity: {
    id: string
    handle: string
    fullHandle: string
    createdAt: string
    profile: {
      id: string
      identityId: string
      displayName: string | null
      bio: string | null
      avatarUrl: string | null
      createdAt: string
      updatedAt: string
    } | null
    user: {
      id: string
      nimiqAddress: string
      createdAt: string
      updatedAt: string
    }
    _count: {
      posts: number
      sentEndorsements: number
      receivedEndorsements: number
    }
  }
  reputation: number
  nimReceived: number
  endorsements: Array<{
    id: string
    fromIdentityId: string
    toIdentityId: string
    amountNim: number
    transactionHash: string
    createdAt: string
    fromIdentity: { handle: string; fullHandle: string }
  }>
  posts: Array<{
    id: string
    identityId: string
    content: string
    createdAt: string
    updatedAt: string
  }>
  reputationBreakdown: Record<string, number>
}

interface ProfilePageProps {
  initialData: ProfileData
}

export function ProfilePageClient({ initialData }: ProfilePageProps) {
  const { account, isAvailable, isConnected } = useNimiqWallet()
  const { createEndorsement } = useEndorsements()
  
  const [data] = useState<ProfileData>(initialData)
  const [tipAmount, setTipAmount] = useState('0.1')
  const [endorsing, setEndorsing] = useState(false)
  const [tipping, setTipping] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  const { identity, reputation, nimReceived, endorsements, posts, reputationBreakdown } = data

  // Check if this is the current user's profile
  useEffect(() => {
    if (account && identity) {
      setIsOwnProfile(account.address === identity.user.nimiqAddress)
    }
  }, [account, identity])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getBadges = () => {
    const badges: Array<{ label: string; variant: 'primary' | 'success' | 'default' }> = []
    
    // Verified Wallet - always present for claimed identities
    badges.push({ label: 'Verified Wallet', variant: 'primary' })
    
    // Early Builder - if identity created early (first 1000) or reputation > 50
    if (reputation > 50) {
      badges.push({ label: 'Early Builder', variant: 'success' })
    }
    
    // Contributor - if has posts
    if (posts.length > 0) {
      badges.push({ label: 'Contributor', variant: 'default' })
    }
    
    // Supporter - if sent endorsements
    if (identity._count.sentEndorsements > 0) {
      badges.push({ label: 'Supporter', variant: 'default' })
    }
    
    return badges
  }

  const handlePayment = async (type: 'tip' | 'endorse') => {
    if (!account || !identity) return
    
    const amount = type === 'tip' ? parseFloat(tipAmount) : 0.1
    const toAddress = identity.user.nimiqAddress
    
    if (type === 'endorse') {
      setEndorsing(true)
    } else {
      setTipping(true)
    }
    setPaymentError(null)
    setPaymentSuccess(null)

    try {
      const result = await sendNimPayment({
        toAddress,
        amountNim: amount,
        memo: type === 'endorse' ? `Endorse ${identity.fullHandle}` : `Tip ${identity.fullHandle}`
      })

      if (!result.success) {
        throw new Error(result.error || 'Payment failed')
      }

      // Record endorsement on backend
      if (type === 'endorse' && result.transactionHash) {
        await createEndorsement(
          '', // fromIdentityId (empty since we're using wallet address)
          identity.id,
          amount,
          result.transactionHash,
          account.address // fromWalletAddress - backend will resolve identity from this
        )
      }

      setPaymentSuccess(
        type === 'endorse' 
          ? `Endorsed ${identity.handle}.neet with ${amount} NIM!`
          : `Tipped ${identity.handle}.neet ${amount} NIM!`
      )

      // Refresh data after successful payment
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setEndorsing(false)
      setTipping(false)
    }
  }

  const canInteract = isAvailable && isConnected && account && !isOwnProfile

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 px-4 py-4 glass sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-mono font-bold text-primary">.neet</Link>
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
        {/* Payment Status Toasts */}
        {paymentError && (
          <div className="fixed top-20 right-4 left-4 md:right-auto md:left-auto md:w-96 glass-strong p-4 rounded-xl border-destructive/50 animate-slide-up z-50">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{paymentError}</span>
            </div>
          </div>
        )}
        {paymentSuccess && (
          <div className="fixed top-20 right-4 left-4 md:right-auto md:left-auto md:w-96 glass-strong p-4 rounded-xl border-primary/50 animate-slide-up z-50">
            <div className="flex items-center gap-2 text-primary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 001.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{paymentSuccess}</span>
            </div>
          </div>
        )}

        <div className="glass-strong p-6 md:p-8 rounded-2xl mb-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="avatar-xl font-mono relative">
              {identity.profile?.avatarUrl ? (
                <img src={identity.profile.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                identity.handle.charAt(0).toUpperCase()
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold font-mono">
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
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {getBadges().map((badge, i) => (
                  <span 
                    key={i} 
                    className={`badge ${badge.variant === 'primary' ? 'badge-primary' : badge.variant === 'success' ? 'badge-success' : ''}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold text-primary">{reputation}</div>
              <div className="text-xs text-muted-foreground">Reputation</div>
            </div>
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold">{posts.length}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold text-primary">{nimReceived.toFixed(5)} NIM</div>
              <div className="text-xs text-muted-foreground">Received</div>
            </div>
          </div>
        </div>

        {/* Tip + Endorse Actions - ONLY for other profiles */}
        {canInteract && !isOwnProfile && (
          <div className="glass-strong p-6 rounded-2xl mb-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Support {identity.handle}.neet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your support builds their reputation. Endorsements are proof-of-support — not just likes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handlePayment('endorse')}
                disabled={endorsing || tipping}
                className="btn btn-primary flex-1 group"
              >
                {endorsing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Endorsing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Endorse (0.1 NIM)
                    <span className="ml-2 text-xs opacity-70">+3 Rep</span>
                  </>
                )}
              </button>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <label className="text-sm text-muted-foreground">Tip:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  max="100"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="input w-24 text-center font-mono"
                />
                <button
                  onClick={() => handlePayment('tip')}
                  disabled={tipping || endorsing}
                  className="btn btn-secondary flex-1 sm:w-auto group"
                >
                  {tipping ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Tipping...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tip
                      <span className="ml-2 text-xs opacity-70">+10 Rep</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isOwnProfile && (
          <div className="glass-strong p-6 rounded-2xl mb-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-4">Your Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <Link href="/app" className="btn btn-primary">Edit Profile</Link>
              <Link href="/app" className="btn btn-secondary">Create Post</Link>
              <button className="btn btn-ghost">Share Profile</button>
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="glass-strong p-6 rounded-2xl mb-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-4">Posts</h3>
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="glass p-4 rounded-xl">
                  <p className="text-foreground">{post.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {endorsements.length > 0 && (
          <div className="glass-strong p-6 rounded-2xl mb-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-4">Recent Endorsements Received</h3>
            <div className="space-y-3">
              {endorsements.map((endorsement) => (
                <div key={endorsement.id} className="flex items-center justify-between glass p-4 rounded-xl hover:bg-glass-hover transition-all">
                  <div className="flex items-center gap-3">
                    <div className="avatar-sm font-mono">
                      {endorsement.fromIdentity.handle.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium font-mono">{endorsement.fromIdentity.fullHandle}</p>
                      <p className="text-xs text-muted-foreground">endorsed you</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium">+{endorsement.amountNim.toFixed(5)} NIM</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(endorsement.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-strong p-6 rounded-2xl animate-slide-up">
          <h3 className="text-lg font-medium mb-4">Reputation Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(reputationBreakdown).map(([type, points]) => (
              <div key={type} className="flex items-center justify-between glass p-3 rounded-xl">
                <span className="text-muted-foreground capitalize">{type.toLowerCase().replace(/_/g, ' ')}</span>
                <span className="text-primary font-medium">+{points}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground/50">
          <p>Share {identity.fullHandle} to help them build reputation</p>
        </div>
      </main>
    </div>
  )
}