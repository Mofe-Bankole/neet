import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const fullHandle = handle.toLowerCase().endsWith('.neet') 
      ? handle.toLowerCase() 
      : `${handle.toLowerCase()}.neet`

    const identity = await prisma.identity.findUnique({
      where: { fullHandle }
    })

    if (!identity) {
      return NextResponse.json(
        { error: 'Identity not found' },
        { status: 404 }
      )
    }

    const [posts, endorsementsReceived, reputationEvents] = await Promise.all([
      prisma.post.findMany({
        where: { identityId: identity.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.endorsement.findMany({
        where: { toIdentityId: identity.id },
        include: {
          fromIdentity: { select: { handle: true, fullHandle: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.reputationEvent.findMany({
        where: { identityId: identity.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    ])

    const activity = [
      ...posts.map(p => ({
        type: 'POST',
        content: p.content,
        createdAt: p.createdAt,
      })),
      ...endorsementsReceived.map(e => ({
        type: 'ENDORSEMENT_RECEIVED',
        from: e.fromIdentity.fullHandle,
        amount: e.amountNim,
        transactionHash: e.transactionHash,
        createdAt: e.createdAt,
      })),
      ...reputationEvents.map(r => ({
        type: 'REPUTATION_EVENT',
        eventType: r.type,
        points: r.points,
        transactionHash: r.transactionHash,
        createdAt: r.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ activity: activity.slice(0, 20) })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}