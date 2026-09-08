import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { handle, nimiqAddress } = body

    if (!handle || !nimiqAddress) {
      return NextResponse.json(
        { error: 'Handle and Nimiq address are required' },
        { status: 400 }
      )
    }

    if (handle.length < 3 || handle.length > 20) {
      return NextResponse.json(
        { error: 'Handle must be between 3 and 20 characters' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(handle)) {
      return NextResponse.json(
        { error: 'Handle can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    const fullHandle = `${handle.toLowerCase()}.neet`

    const existingIdentity = await prisma.identity.findUnique({
      where: { fullHandle }
    })

    if (existingIdentity) {
      return NextResponse.json(
        { error: 'This handle is already taken' },
        { status: 409 }
      )
    }

    let user = await prisma.user.findUnique({
      where: { nimiqAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { nimiqAddress }
      })
    }

    const existingUserIdentity = await prisma.identity.findUnique({
      where: { userId: user.id }
    })

    if (existingUserIdentity) {
      return NextResponse.json(
        { error: 'This wallet already has a .neet identity' },
        { status: 409 }
      )
    }

    const identity = await prisma.identity.create({
      data: {
        userId: user.id,
        handle: handle.toLowerCase(),
        fullHandle,
      }
    })

    await prisma.reputationEvent.create({
      data: {
        identityId: identity.id,
        userId: user.id,
        type: 'CLAIM_IDENTITY',
        points: 10,
      }
    })

    return NextResponse.json({
      identity: {
        id: identity.id,
        handle: identity.handle,
        fullHandle: identity.fullHandle,
        createdAt: identity.createdAt,
      }
    })
  } catch (error) {
    console.error('Error claiming identity:', error)
    return NextResponse.json(
      { error: 'Failed to claim identity' },
      { status: 500 }
    )
  }
}