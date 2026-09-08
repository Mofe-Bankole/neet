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
      return NextResponse.json(
        { error: 'Identity not found' },
        { status: 404 }
      )
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

    return NextResponse.json({
      identity: {
        id: identity.id,
        handle: identity.handle,
        fullHandle: identity.fullHandle,
        createdAt: identity.createdAt,
        profile: identity.profile,
        reputation: totalReputation,
        stats: {
          posts: identity._count.posts,
          endorsementsSent: identity._count.sentEndorsements,
          endorsementsReceived: identity._count.receivedEndorsements,
          nimReceived: parseFloat(nimReceived.toFixed(5)),
        }
      },
      recentEndorsements: endorsements.map(e => ({
        from: e.fromIdentity.fullHandle,
        amount: e.amountNim,
        transactionHash: e.transactionHash,
        createdAt: e.createdAt,
      }))
    })
  } catch (error) {
    console.error('Error fetching identity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch identity' },
      { status: 500 }
    )
  }
}