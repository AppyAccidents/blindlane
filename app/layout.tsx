// ============================================
// Root Layout - Terminal Theme
// ============================================

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlindLane >_ The Pepsi Challenge for AI',
  description: 'Compare GPT-4o Mini vs Claude 3.5 Haiku anonymously. Vote for the winner.',
  keywords: ['AI comparison', 'LLM benchmark', 'GPT-4', 'Claude', 'blind test'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Background Grid Effect */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-orange-500/5" />
        </div>
        
        {/* Header */}
        <header className="relative z-10 border-b border-cyan-500/20 bg-black/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="/" className="flex items-center gap-3 group">
              {/* Terminal Icon */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded border border-cyan-500/50 bg-cyan-500/10 transition-all group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                <span className="text-cyan-400 font-bold text-lg">&gt;_</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-cyan-400 glow-cyan">Blind</span>
                  <span className="text-orange-500 glow-orange">Lane</span>
                </span>
                <span className="block text-[10px] text-cyan-600 uppercase tracking-widest">
                  Model Comparison Protocol
                </span>
              </div>
            </a>
            
            <nav className="flex items-center gap-1">
              <NavLink href="/" icon="⌘">Compare</NavLink>
              <NavLink href="/leaderboard" icon="◈">Leaderboard</NavLink>
              <NavLink href="/about" icon="?">About</NavLink>
              <div className="mx-2 h-6 w-px bg-cyan-500/20" />
              <NavLink href="/admin" icon="⚡">Admin</NavLink>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-cyan-500/10 bg-black/50">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-4 text-xs text-cyan-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  System Operational
                </span>
                <span>|</span>
                <span>v0.1.0-alpha</span>
              </div>
              <p className="text-xs text-cyan-700">
                Not affiliated with OpenAI or Anthropic
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

// Navigation Link Component
function NavLink({ 
  href, 
  children, 
  icon 
}: { 
  href: string; 
  children: React.ReactNode;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400/70 transition-all hover:text-cyan-400 rounded-md hover:bg-cyan-500/10"
    >
      <span className="text-cyan-600">{icon}</span>
      <span className="font-medium">{children}</span>
    </a>
  );
}
