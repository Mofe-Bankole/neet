'use client'

import { useState, useEffect } from 'react'
import { useNimiqWallet } from '@/hooks/useNimiqWallet'
import { formatNimAddress } from '@/lib/nimiq'
import Link from 'next/link'

export function Navbar() {
  const { account, isConnecting, isAvailable, connect, isConnected } = useNimiqWallet()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isAvailable) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-mono font-bold text-primary">.neet</Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
              <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">Open in Nimiq Pay</span>
            </div>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-mono font-bold text-primary">.neet</Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/app" className="btn btn-ghost btn-sm">Launch App</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isConnected && account && (
              <div className="flex items-center gap-3">
                <span className="badge badge-primary font-mono text-xs">
                  {account.network.toUpperCase()}
                </span>
                <span className="font-mono text-sm text-muted-foreground">{formatNimAddress(account.address)}</span>
              </div>
            )}
            {!isConnected && (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn btn-primary btn-sm"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg glass hover:bg-glass-hover transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">Features</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">How it Works</Link>
              <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">About</Link>
              <Link href="/app" className="btn btn-secondary text-center">Launch App</Link>
              {!isConnected && (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="btn btn-primary text-center"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
              {isConnected && account && (
                <div className="flex items-center gap-3 px-2 py-2">
                  <span className="badge badge-primary font-mono text-xs">
                    {account.network.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">{formatNimAddress(account.address)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}