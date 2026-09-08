'use client'

import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { Features } from './Features'
import { HowItWorks } from './HowItWorks'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}