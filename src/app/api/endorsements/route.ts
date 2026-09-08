import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromIdentityId, fromWalletAddress, toIdentityId, amountNim, transactionHash } = body

    if ((!fromIdentityId && !fromWalletAddress) || !toIdentityId || !amountNim || !transactionHash) {
      return NextResponse.json(
        { error: 'All fields are required (fromIdentityId or fromWalletAddress, toIdentityId, amountNim, transactionHash)' },
        { status: 400 }
      )
    }

    if (amountNim <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      )
    }

    // Resolve fromIdentity
    let fromIdentity: { id: string; userId: string } | null = null
    
    if (fromIdentityId && fromIdentityId !== 'current') {
      fromIdentity = await prisma.identity.findUnique({ 
        where: { id: fromIdentityId }, 
        select: { id: true, userId: true }
      })
    } else if (fromWalletAddress) {
      const user = await prisma.user.findUnique({ 
        where: { nimiqAddress: fromWalletAddress },
        include: { identity: { select: { id: true } } }
      })
      if (user?.identity) {
        fromIdentity = { id: user.identity.id, userId: user.id }
      }
    }

    const toIdentity = await prisma.identity.findUnique({ 
      where: { id: toIdentityId }, 
      select: { id: true, userId: true }
    })

    if (!fromIdentity || !toIdentity) {
      return NextResponse.json(
        { error: 'One or both identities not found' },
        { status: 404 }
      )
    }

    if (fromIdentity.id === toIdentity.id) {
      return NextResponse.json(
        { error: 'Cannot endorse yourself' },
        { status: 400 }
      )
    }

    const existingEndorsement = await prisma.endorsement.findFirst({
      where: {
        fromIdentityId: fromIdentity.id,
        toIdentityId,
        transactionHash,
      }
    })

    if (existingEndorsement) {
      return NextResponse.json(
        { error: 'This endorsement has already been recorded' },
        { status: 409 }
      )
    }

    const endorsement = await prisma.endorsement.create({
      data: {
        fromIdentityId: fromIdentity.id,
        toIdentityId,
        fromUserId: fromIdentity.userId,
        toUserId: toIdentity.userId,
        amountNim,
        transactionHash,
      }
    })

    await prisma.reputationEvent.create({
      data: {
        identityId: toIdentityId,
        userId: toIdentity.userId,
        actorIdentityId: fromIdentity.id,
        type: 'RECEIVE_ENDORSEMENT',
        points: 3,
        transactionHash,
      }
    })

    await prisma.reputationEvent.create({
      data: {
        identityId: fromIdentity.id,
        userId: fromIdentity.userId,
        actorIdentityId: toIdentityId,
        type: 'SEND_ENDORSEMENT',
        points: 2,
        transactionHash,
      }
    })

    return NextResponse.json({ endorsement })
  } catch (error) {
    console.error('Error creating endorsement:', error)
    return NextResponse.json(
      { error: 'Failed to create endorsement' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get('handle')
    const type = searchParams.get('type') // 'sent' | 'received'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      )
    }

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

    const where = type === 'sent' 
      ? { fromIdentityId: identity.id }
      : type === 'received'
        ? { toIdentityId: identity.id }
        : {
            OR: [
              { fromIdentityId: identity.id },
              { toIdentityId: identity.id },
            ]
          }

    const endorsements = await prisma.endorsement.findMany({
      where,
      include: {
        fromIdentity: { select: { handle: true, fullHandle: true } },
        toIdentity: { select: { handle: true, fullHandle: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ endorsements })
  } catch (error) {
    console.error('Error fetching endorsements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch endorsements' },
      { status: 500 }
    )
  }
}