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

    const events = await prisma.reputationEvent.findMany({
      where: { identityId: identity.id },
      orderBy: { createdAt: 'desc' }
    })

    const totalReputation = events.reduce((sum, event) => sum + event.points, 0)

    const breakdown = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + event.points
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      reputation: totalReputation,
      breakdown,
      events: events.map(e => ({
        type: e.type,
        points: e.points,
        transactionHash: e.transactionHash,
        createdAt: e.createdAt,
      }))
    })
  } catch (error) {
    console.error('Error fetching reputation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reputation' },
      { status: 500 }
    )
  }
}