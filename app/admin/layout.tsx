'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BarChart3, LayoutDashboard, List, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/comparisons', label: 'Comparisons', icon: List },
  { href: '/admin/stats', label: 'Stats', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <AdminNav pathname={pathname} />
      </aside>

      <div className="space-y-4">
        <div className="flex items-center justify-between lg:hidden">
          <h1 className="text-base font-semibold">Admin Panel</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open admin navigation">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card">
              <SheetHeader>
                <SheetTitle>Admin</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <AdminNav pathname={pathname} compact />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}

function AdminNav({ pathname, compact = false }: { pathname: string; compact?: boolean }) {
  return (
    <Card className={compact ? 'border-none bg-transparent shadow-none' : 'sticky top-20'}>
      <CardContent className="space-y-2 p-4">
        <div className="mb-2 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <p className="text-sm font-semibold">BlindLane Admin</p>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', isActive ? 'text-foreground' : 'text-muted-foreground')}
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}

        <div className="pt-3">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspace
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
