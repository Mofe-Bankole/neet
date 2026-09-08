import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const identities = await prisma.identity.findMany({
      where: {
        OR: [
          { handle: { contains: q.toLowerCase(), mode: 'insensitive' } },
          { fullHandle: { contains: q.toLowerCase(), mode: 'insensitive' } },
        ]
      },
      include: {
        profile: true,
        _count: {
          select: {
            posts: true,
            receivedEndorsements: true,
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    const results = await Promise.all(identities.map(async (identity) => {
      const reputationEvents = await prisma.reputationEvent.findMany({
        where: { identityId: identity.id }
      })
      const totalReputation = reputationEvents.reduce((sum, e) => sum + e.points, 0)

      return {
        handle: identity.handle,
        fullHandle: identity.fullHandle,
        displayName: identity.profile?.displayName,
        avatarUrl: identity.profile?.avatarUrl,
        bio: identity.profile?.bio,
        reputation: totalReputation,
        postsCount: identity._count.posts,
        endorsementsCount: identity._count.receivedEndorsements,
        createdAt: identity.createdAt,
      }
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching identities:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}