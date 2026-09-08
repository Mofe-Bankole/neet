'use client'

import { useState, useCallback } from 'react'

export interface Identity {
  id: string
  handle: string
  fullHandle: string
  createdAt: string
  profile?: Profile | null
  reputation?: number
  stats?: {
    posts: number
    endorsementsSent: number
    endorsementsReceived: number
    nimReceived: number
  }
}

export interface Profile {
  id: string
  identityId: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  identityId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Endorsement {
  id: string
  fromIdentityId: string
  toIdentityId: string
  amountNim: number
  transactionHash: string
  createdAt: string
  fromIdentity?: { handle: string; fullHandle: string }
  toIdentity?: { handle: string; fullHandle: string }
}

export interface ActivityItem {
  type: 'POST' | 'ENDORSEMENT_RECEIVED' | 'REPUTATION_EVENT'
  content?: string
  from?: string
  amount?: number
  transactionHash?: string
  eventType?: string
  points?: number
  createdAt: string
}

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIdentity = useCallback(async (handle: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/identity/${handle}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch identity')
      }
      const data = await response.json()
      setIdentity(data.identity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch identity')
      setIdentity(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const claimIdentity = useCallback(async (handle: string, nimiqAddress: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/identity/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, nimiqAddress }),
      })
      
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to claim identity')
      }
      
      const data = await response.json()
      setIdentity(data.identity)
      return data.identity
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim identity')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkAvailability = useCallback(async (handle: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/identity/${handle}`)
      return response.status === 404
    } catch {
      return false
    }
  }, [])

  return {
    identity,
    isLoading,
    error,
    fetchIdentity,
    claimIdentity,
    checkAvailability,
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (handle: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/profile?handle=${handle}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (
    identityId: string,
    data: Partial<Pick<Profile, 'displayName' | 'bio' | 'avatarUrl'>>
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId, ...data }),
      })
      
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to update profile')
      }
      
      const result = await response.json()
      setProfile(result.profile)
      return result.profile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  }
}

export function usePosts(identityId?: string) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async (handle: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/posts?handle=${handle}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch posts')
      }
      const data = await response.json()
      setPosts(data.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPost = useCallback(async (identityId: string, content: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId, content }),
      })
      
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create post')
      }
      
      const data = await response.json()
      setPosts(prev => [data.post, ...prev])
      return data.post
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
  }
}

export function useEndorsements() {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEndorsements = useCallback(async (handle: string, type?: 'sent' | 'received') => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({ handle })
      if (type) params.append('type', type)
      
      const response = await fetch(`/api/endorsements?${params}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch endorsements')
      }
      const data = await response.json()
      setEndorsements(data.endorsements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch endorsements')
      setEndorsements([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createEndorsement = useCallback(async (
    fromIdentityId: string,
    toIdentityId: string,
    amountNim: number,
    transactionHash: string,
    fromWalletAddress?: string
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const body: Record<string, any> = { toIdentityId, amountNim, transactionHash }
      if (fromWalletAddress) {
        body.fromWalletAddress = fromWalletAddress
      } else {
        body.fromIdentityId = fromIdentityId
      }
      
      const response = await fetch('/api/endorsements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to record endorsement')
      }
      
      const data = await response.json()
      setEndorsements(prev => [data.endorsement, ...prev])
      return data.endorsement
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record endorsement')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    endorsements,
    isLoading,
    error,
    fetchEndorsements,
    createEndorsement,
  }
}

export function useReputation(handle?: string) {
  const [reputation, setReputation] = useState<{
    reputation: number
    breakdown: Record<string, number>
    events: Array<{ type: string; points: number; transactionHash?: string; createdAt: string }>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReputation = useCallback(async (handle: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/reputation/${handle}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch reputation')
      }
      const data = await response.json()
      setReputation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reputation')
      setReputation(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    reputation,
    isLoading,
    error,
    fetchReputation,
  }
}

export function useActivity(handle?: string) {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivity = useCallback(async (handle: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/activity/${handle}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch activity')
      }
      const data = await response.json()
      setActivity(data.activity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity')
      setActivity([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    activity,
    isLoading,
    error,
    fetchActivity,
  }
}

export function useSearch() {
  const [results, setResults] = useState<Identity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([])
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to search')
      }
      const data = await response.json()
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    results,
    isLoading,
    error,
    search,
  }
}