'use client'

import { useState, useEffect } from 'react'
import { useNimiqWallet } from '@/hooks/useNimiqWallet'
import { formatNimAddress } from '@/lib/nimiq'
import Link from 'next/link'
import { Button, Badge, Avatar } from '@/components/ui'

export function Navbar() {
  const { account, isConnecting, isAvailable, connect, isConnected } = useNimiqWallet()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navStyle = {
    background: scrolled ? 'rgba(22, 22, 40, 0.9)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(45, 45, 68, 0.6)' : 'none',
    transition: 'all 0.3s ease',
  }

  if (!isAvailable) {
    return (
      <header style={navStyle} className="fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-mono font-bold text-primary">.neet</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
              <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">Open in Nimiq Pay</span>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header style={navStyle} className="fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-mono font-bold text-primary">.neet</Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/app">
              <Button variant="ghost" size="sm">Launch App</Button>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isConnected && account && (
              <div className="flex items-center gap-3">
<Badge color="accent" variant="primary" className="font-mono text-xs">
                  {account.network.toUpperCase()}
                </Badge>
                <Avatar size="sm" className="bg-primary/20 text-primary">
                  {formatNimAddress(account.address).charAt(0)}
                </Avatar>
                <span className="font-mono text-sm text-muted-foreground">{formatNimAddress(account.address)}</span>
              </div>
            )}
            {!isConnected && (
              <Button 
                onPress={connect} 
                isDisabled={isConnecting}
                variant="primary"
                size="sm"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          </Button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-3">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">Features</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">How it Works</Link>
              <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">About</Link>
              <Link href="/app">
                <Button variant="secondary" className="w-full">Launch App</Button>
              </Link>
              {!isConnected && (
                <Button 
                  onPress={connect} 
                  isDisabled={isConnecting}
                  variant="primary"
                  className="w-full"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
              {isConnected && account && (
                <div className="flex items-center gap-3 px-2 py-2">
<Badge color="accent" variant="primary" className="font-mono text-xs">
                    {account.network.toUpperCase()}
                  </Badge>
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