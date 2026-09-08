import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 px-4 py-4 glass sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-mono font-bold text-primary">.neet</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-strong p-6 md:p-8 rounded-2xl mb-6">
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
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold text-primary">{totalReputation}</div>
              <div className="text-xs text-muted-foreground">Reputation</div>
            </div>
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold">{identity._count.posts}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center glass p-4 rounded-xl">
              <div className="text-3xl font-bold text-primary">{nimReceived.toFixed(5)} NIM</div>
              <div className="text-xs text-muted-foreground">Received</div>
            </div>
          </div>
        </div>

        {posts.length > 0 && (
          <div className="glass-strong p-6 rounded-2xl mb-6">
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
          <div className="glass-strong p-6 rounded-2xl mb-6">
            <h3 className="text-lg font-medium mb-4">Recent Endorsements</h3>
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

        <div className="glass-strong p-6 rounded-2xl">
          <h3 className="text-lg font-medium mb-4">Reputation Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(
              reputationEvents.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + event.points
                return acc
              }, {} as Record<string, number>)
            ).map(([type, points]) => (
              <div key={type} className="flex items-center justify-between glass p-3 rounded-xl">
                <span className="text-muted-foreground capitalize">{type.toLowerCase().replace(/_/g, ' ')}</span>
                <span className="text-primary font-medium">+{points}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}