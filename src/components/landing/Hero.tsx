'use client'

import { useNimiqWallet } from '@/hooks/useNimiqWallet'
import Link from 'next/link'
import { Button, Badge } from '@/components/ui'

export function Hero() {
  const { isConnected, isConnecting, connect, isAvailable } = useNimiqWallet()

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <style jsx>{`
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          pointer-events: none;
        }
        .orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle at 30% 30%, var(--primary) 0%, transparent 70%);
          animation: float1 25s ease-in-out infinite;
        }
        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle at 70% 70%, var(--primary) 0%, transparent 70%);
          animation: float2 30s ease-in-out infinite reverse;
        }
        .orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 70%);
          animation: float3 35s ease-in-out infinite;
          opacity: 0.1;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          14% { transform: translate(120px, -80px) scale(1.1); }
          28% { transform: translate(-60px, 140px) scale(0.95); }
          42% { transform: translate(-100px, -40px) scale(1.05); }
          56% { transform: translate(80px, 100px) scale(0.9); }
          70% { transform: translate(-140px, 20px) scale(1.08); }
          84% { transform: translate(40px, -120px) scale(1.02); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          11% { transform: translate(-100px, 100px) scale(1.15); }
          22% { transform: translate(140px, 60px) scale(0.9); }
          33% { transform: translate(20px, -120px) scale(1.08); }
          44% { transform: translate(-160px, -80px) scale(1.0); }
          55% { transform: translate(60px, 160px) scale(0.95); }
          66% { transform: translate(180px, -20px) scale(1.1); }
          77% { transform: translate(-80px, 40px) scale(1.05); }
          88% { transform: translate(100px, -140px) scale(1.0); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          16% { transform: translate(60px, -100px) scale(1.2); }
          32% { transform: translate(-120px, 20px) scale(0.85); }
          48% { transform: translate(80px, 140px) scale(1.1); }
          64% { transform: translate(-140px, -60px) scale(0.9); }
          80% { transform: translate(100px, 80px) scale(1.05); }
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="soft" color="accent" className="gap-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Live on Nimiq Pay • Mini App Competition Cycle 2</span>
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-slide-up tracking-tight">
            Your Identity
            <br />
            <span className="text-gradient">On Nimiq</span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Claim your human-readable <code className="text-primary bg-primary/10 px-2 py-0.5 rounded">.neet</code> name.
            Build portable reputation through real wallet activity, NIM payments & endorsements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {isAvailable ? (
              <>
                {isConnected ? (
                  <Link href="/app">
                    <Button variant="primary" size="lg" className="group w-full sm:w-auto">
                      <span>Launch App</span>
                      <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onPress={connect} 
                    isDisabled={isConnecting}
                    variant="primary"
                    size="lg"
                    className="group w-full sm:w-auto"
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        Try Now
                        <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </Button>
                )}
                <Link href="#features">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Explore Features
                  </Button>
                </Link>
              </>
            ) : (
              <div className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full" isDisabled>
                  Open in Nimiq Pay
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  This Mini App only works inside Nimiq Pay
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No seed phrases</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Instant setup</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Portable reputation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}