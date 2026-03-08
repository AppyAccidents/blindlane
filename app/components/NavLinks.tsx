'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const primaryNav = [
  { href: '/', label: 'Workspace' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
];

const adminNav = { href: '/admin', label: 'Admin' };

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {primaryNav.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              'font-sans text-xs font-black uppercase tracking-widest',
              isActive(pathname, item.href)
                ? 'text-foreground underline underline-offset-4 decoration-2'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        ))}
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Button
          asChild
          variant="ghost"
          className={cn(
            'font-sans text-xs font-black uppercase tracking-widest opacity-60',
            isActive(pathname, adminNav.href)
              ? 'text-foreground underline underline-offset-4 decoration-2 opacity-100'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Link href={adminNav.href}>{adminNav.label}</Link>
        </Button>
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="border-border bg-card">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-2">
            {primaryNav.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={isActive(pathname, item.href) ? 'secondary' : 'ghost'}
                className="justify-start"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Separator className="my-2" />
            <Button
              asChild
              variant={isActive(pathname, adminNav.href) ? 'secondary' : 'ghost'}
              className="justify-start opacity-60"
            >
              <Link href={adminNav.href}>{adminNav.label}</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
