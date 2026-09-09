'use client'

import { Card, CardContent, Badge, Avatar, Button } from '@/components/ui'

const steps = [
  {
    number: '01',
    title: 'Open Nimiq Pay',
    description: 'Launch the Nimiq Pay app on your device. No separate installation needed — .neet runs as a Mini App inside Nimiq Pay.',
  },
  {
    number: '02',
    title: 'Launch .neet',
    description: 'Find .neet in the Mini Apps section and open it. Your wallet identity is automatically detected — no connect button required.',
  },
  {
    number: '03',
    title: 'Claim Your Name',
    description: 'Search for your desired handle (e.g., <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">alice</code>). If available, claim it instantly. Your <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">alice.neet</code> is now yours forever.',
  },
  {
    number: '04',
    title: 'Build Reputation',
    description: 'Complete your profile, post updates, receive NIM tips, and endorse others. Every action adds to your deterministic reputation score.',
  },
  {
    number: '05',
    title: 'Share & Grow',
    description: 'Share your <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">.neet</code> profile. Others can endorse you with NIM, boosting your reputation. Your identity travels across the Nimiq ecosystem.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-4">How It Works</span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            From wallet to{' '}
            <span className="text-gradient">identity in seconds</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No complex setup. No seed phrases. Just open Nimiq Pay and claim your name.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-transparent to-primary/50 -translate-x-1/2" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex items-start gap-8 animate-slide-up ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`flex-shrink-0 w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                  <Card className="h-full card-elevated">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-bold text-primary/20">{step.number}</span>
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className={`flex-shrink-0 w-full lg:w-1/2 flex items-center justify-center ${index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'}`}>
                  <Card className="relative w-full max-w-md aspect-square overflow-hidden card-elevated">
                    <CardContent className="p-0 h-full flex items-center justify-center">
                      <StepVisual step={step.number} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepVisual({ step }: { step: string }) {
  const visuals: Record<string, React.ReactNode> = {
    '01': (
      <div className="text-center p-8">
        <div className="w-20 h-20 mx-auto mb-4 glass rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-muted-foreground">Nimiq Pay App</p>
      </div>
    ),
    '02': (
      <div className="text-center p-8">
        <div className="w-20 h-20 mx-auto mb-4 glass rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-muted-foreground">Mini Apps Menu</p>
      </div>
    ),
    '03': (
      <div className="text-center p-8">
        <div className="w-full max-w-xs mx-auto glass rounded-xl p-4">
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="alice" className="flex-1 glass border-none px-3 py-2 rounded-lg text-center" disabled />
            <span className="flex items-center px-3 text-muted-foreground">.neet</span>
          </div>
          <Button variant="primary" className="w-full" isDisabled>Claim alice.neet</Button>
        </div>
      </div>
    ),
    '04': (
      <div className="text-center p-8">
        <div className="w-full max-w-xs mx-auto glass rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="glass p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">43</div>
              <div className="text-xs text-muted-foreground">Rep</div>
            </div>
            <div className="glass p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="glass p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">24.5</div>
              <div className="text-xs text-muted-foreground">NIM</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge color="success" variant="primary">Verified Wallet</Badge>
            <Badge color="accent" variant="primary">Early Builder</Badge>
          </div>
        </div>
      </div>
    ),
    '05': (
      <div className="text-center p-8">
        <div className="w-full max-w-xs mx-auto glass rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar size="lg" className="bg-primary/15 text-primary">A</Avatar>
            <div className="text-left">
              <div className="font-medium font-mono">alice.neet</div>
              <div className="text-sm text-primary">+0.1 NIM endorsement</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="bg-primary/15 text-primary">J</Avatar>
            <div className="text-left">
              <div className="font-medium font-mono">james.neet</div>
              <div className="text-sm text-muted-foreground">Rep: 43 → 48</div>
            </div>
          </div>
        </div>
      </div>
    ),
  }

  return visuals[step] || null
}