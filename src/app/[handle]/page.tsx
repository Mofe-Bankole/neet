import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProfilePageClient } from '@/components/ProfilePageClient'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const fullHandle = handle.toLowerCase().endsWith('.neet') 
    ? handle.toLowerCase() 
    : `${handle.toLowerCase()}.neet`

  const identity = await prisma.identity.findUnique({
    where: { fullHandle },
    include: { profile: true }
  })

  if (!identity) {
    return {
      title: `${fullHandle} — .neet`,
      description: 'Identity not found'
    }
  }

  return {
    title: `${identity.fullHandle} — .neet`,
    description: identity.profile?.bio || `View ${identity.fullHandle}'s profile on .neet`,
    openGraph: {
      title: identity.fullHandle,
      description: identity.profile?.bio || `View ${identity.fullHandle}'s profile on .neet`,
      type: 'profile',
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { handle } = await params
  const fullHandle = handle.toLowerCase().endsWith('.neet') 
    ? handle.toLowerCase() 
    : `${handle.toLowerCase()}.neet`

  const identity = await prisma.identity.findUnique({
    where: { fullHandle },
    include: {
      profile: true,
      user: true,
      _count: {
        select: {
          posts: true,
          sentEndorsements: true,
          receivedEndorsements: true,
        }
      }
    }
  })

  if (!identity) {
    notFound()
  }

  const reputationEvents = await prisma.reputationEvent.findMany({
    where: { identityId: identity.id },
    orderBy: { createdAt: 'desc' }
  })

  const totalReputation = reputationEvents.reduce((sum, event) => sum + event.points, 0)

  const endorsements = await prisma.endorsement.findMany({
    where: { toIdentityId: identity.id },
    include: {
      fromIdentity: {
        select: { handle: true, fullHandle: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  const nimReceived = endorsements.reduce((sum, e) => sum + e.amountNim, 0)

  const posts = await prisma.post.findMany({
    where: { identityId: identity.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const reputationBreakdown = reputationEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + event.points
    return acc
  }, {} as Record<string, number>)

  const profileData = {
    identity: {
      id: identity.id,
      handle: identity.handle,
      fullHandle: identity.fullHandle,
      createdAt: identity.createdAt.toISOString(),
      profile: identity.profile ? {
        id: identity.profile.id,
        identityId: identity.profile.identityId,
        displayName: identity.profile.displayName,
        bio: identity.profile.bio,
        avatarUrl: identity.profile.avatarUrl,
        createdAt: identity.profile.createdAt.toISOString(),
        updatedAt: identity.profile.updatedAt.toISOString(),
      } : null,
      user: {
        id: identity.user.id,
        nimiqAddress: identity.user.nimiqAddress,
        createdAt: identity.user.createdAt.toISOString(),
        updatedAt: identity.user.updatedAt.toISOString(),
      },
      _count: {
        posts: identity._count.posts,
        sentEndorsements: identity._count.sentEndorsements,
        receivedEndorsements: identity._count.receivedEndorsements,
      }
    },
    reputation: totalReputation,
    nimReceived,
    endorsements: endorsements.map(e => ({
      id: e.id,
      fromIdentityId: e.fromIdentityId,
      toIdentityId: e.toIdentityId,
      amountNim: e.amountNim,
      transactionHash: e.transactionHash,
      createdAt: e.createdAt.toISOString(),
      fromIdentity: {
        handle: e.fromIdentity.handle,
        fullHandle: e.fromIdentity.fullHandle,
      }
    })),
    posts: posts.map(p => ({
      id: p.id,
      identityId: p.identityId,
      content: p.content,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    reputationBreakdown,
  }

  return <ProfilePageClient initialData={profileData} />
}