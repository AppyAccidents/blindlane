// ============================================
// Root Layout
// This wraps every page in the app
// ============================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlindLane - The Pepsi Challenge for AI',
  description: 'Compare GPT-4o Mini vs Claude 3.5 Haiku anonymously. Vote for the winner and see which AI you prefer!',
  keywords: ['AI comparison', 'LLM benchmark', 'GPT-4', 'Claude', 'blind test'],
  openGraph: {
    title: 'BlindLane - The Pepsi Challenge for AI',
    description: 'Can you tell which AI is which? Test your intuition with blind comparisons.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          {/* Header */}
          <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  B
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BlindLane
                </span>
              </a>
              <nav className="flex items-center gap-4">
                <a 
                  href="/leaderboard" 
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Leaderboard
                </a>
                <a 
                  href="/about" 
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  About
                </a>
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t bg-white/50 dark:bg-slate-950/50 mt-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Built with Next.js + Supabase + Vercel
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Not affiliated with OpenAI or Anthropic
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
