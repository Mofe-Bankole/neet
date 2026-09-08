import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { identityId, displayName, bio, avatarUrl } = body

    if (!identityId) {
      return NextResponse.json(
        { error: 'Identity ID is required' },
        { status: 400 }
      )
    }

    const identity = await prisma.identity.findUnique({
      where: { id: identityId },
      include: { profile: true }
    })

    if (!identity) {
      return NextResponse.json(
        { error: 'Identity not found' },
        { status: 404 }
      )
    }

    let profile
    if (identity.profile) {
      profile = await prisma.profile.update({
        where: { identityId },
        data: {
          displayName: displayName ?? identity.profile.displayName,
          bio: bio ?? identity.profile.bio,
          avatarUrl: avatarUrl ?? identity.profile.avatarUrl,
        }
      })
    } else {
      profile = await prisma.profile.create({
        data: {
          identityId,
          displayName,
          bio,
          avatarUrl,
        }
      })

      await prisma.reputationEvent.create({
        data: {
          identityId,
          userId: identity.userId,
          type: 'COMPLETE_PROFILE',
          points: 5,
        }
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get('handle')

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
      where: { fullHandle },
      include: { profile: true }
    })

    if (!identity) {
      return NextResponse.json(
        { error: 'Identity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile: identity.profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}