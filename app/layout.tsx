import type { Metadata } from 'next';
import Link from 'next/link';
import { NavLinks } from '@/app/components/NavLinks';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlindLane | Arena Editor',
  description: 'Blind taste testing for content. Editor-first workspace with Arena mode.',
  keywords: ['AI comparison', 'LLM arena', 'blind evaluation', 'content editor'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b-2 border-slate-900 dark:border-slate-800 bg-background">
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 md:px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground font-bold">
                  B
                </div>
                <span className="font-serif text-xl font-black tracking-tighter uppercase italic text-foreground">BlindLane</span>
              </Link>

              <NavLinks />
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>

          <footer className="border-t-2 border-slate-900 dark:border-slate-800">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground md:px-6">
              <span>BlindLane</span>
              <span>Not affiliated with OpenAI, Anthropic, or Google</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
