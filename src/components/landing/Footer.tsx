import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-mono font-bold text-primary">.neet</Link>
            <p className="text-muted-foreground mt-4 text-sm max-w-xs">
              Your identity on Nimiq. Build portable reputation through real wallet activity.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/app" className="hover:text-foreground transition-colors">Launch App</Link></li>
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/api" className="hover:text-foreground transition-colors">API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://nimiq.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Nimiq</a></li>
              <li><a href="https://pay.nimiq.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Nimiq Pay</a></li>
              <li><a href="https://github.com/nimiq" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="https://discord.gg/nimiq" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/license" className="hover:text-foreground transition-colors">MIT License</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Built for Nimiq Mini Apps Competition Cycle 2. Open source under MIT.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Mofe-Bankole/namiq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://twitter.com/nimiq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://discord.gg/nimiq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Discord">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.38-.444.873-.608 1.249a20.306 20.306 0 0 0-5.487 0 12.42 12.42 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.676 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-.062.076.076 0 0 0 .04-.07c.13-.225.298-.567.404-.794.083-.18.112-.365.112-.545 0-.282-.213-.642-.478-.82a.123.123 0 0 0-.087-.028c-.353-.002-2.733-.25-3.654-.67a.077.077 0 0 0-.035-.006.071.071 0 0 0-.066.046.09.09 0 0 0-.012.064c0 .48.07.766.273 1.22a14.733 14.733 0 0 0 .902 4.404 27.038 27.038 0 0 0 6.35 3.418.077.077 0 0 0 .076-.045c.146-.247.299-.709.299-1.123 0-.614-.396-.895-.678-.931a1.24 1.24 0 0 1-.647-.082 2.543 2.543 0 0 1-.434-.023.07.07 0 0 0-.059-.007c-.488.002-1.243.007-1.718-.076a.074.074 0 0 0-.041.01 16.79 16.79 0 0 0-4.707-1.683.061.061 0 0 0-.056-.003.074.074 0 0 1-.054-.071c-.146-.371-.146-.917.02-1.322.086-.21.365-.497.684-.762a20.5 20.5 0 0 1 1.761-.951c.18-.02.272-.033.272-.033s.213.037.422.247a.071.071 0 0 0 .063-.02c.2-.16.517-.423.903-.558a24.573 24.573 0 0 1 3.039-.628c.585 0 1.15.027 1.692.082a.07.07 0 0 0 .06-.019c.356-.15.62-.423.805-.845.05-.12.112-.276.112-.405 0-.255-.15-.576-.455-.776a.077.077 0 0 0-.049-.012c-.337-.003-2.746-.04-3.663-.098a.077.077 0 0 0-.035-.003.071.071 0 0 0-.066.046c-.053.173-.09.428-.09.708 0 .393.062.76.233 1.02a2.72 2.72 0 0 0 .387.74.076.076 0 0 0 .04.07c.273.204.754.418 1.213.418.463 0 .932-.18 1.242-.486a.07.07 0 0 0 .02-.07c-.12-.417-.44-.87-.802-1.203a.077.077 0 0 0-.076-.02c-.353.005-.897.044-1.26.09a.074.074 0 0 0-.038.048c-.163.288-.406.73-.526 1.135a.08.08 0 0 1-.052.077c-.513.053-1.01.094-1.492.12a.077.077 0 0 0-.04.05c-.14.325-.188.842-.054 1.217.1.283.44.592.77.762a.085.085 0 0 0 .077.007c.654-.06 1.507-.273 2.173-.658a.075.075 0 0 0 .032-.075c-.094-.235-.227-.59-.345-.83a.077.077 0 0 0-.02-.081 12.29 12.29 0 0 1-.47-.651.077.077 0 0 0-.02-.078c.226-.387.378-.86.378-1.292 0-.547-.243-.934-.605-1.122a.077.077 0 0 0-.073-.031c-.533-.017-1.14-.056-1.54-.056h-.005a.08.08 0 0 1-.063-.042zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333 1.006-2.418 2.157-2.418 1.168 0 2.137.974 2.137 2.346 0 1.28-.987 2.318-2.137 2.491zm7.978 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333 1.007-2.418 2.157-2.418 1.15 0 2.119.974 2.119 2.346 0 1.28-.987 2.318-2.119 2.491z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}