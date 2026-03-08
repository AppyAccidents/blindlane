'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

const SheetOverlay = React.forwardRef<React.ElementRef<typeof Dialog.Overlay>, React.ComponentPropsWithoutRef<typeof Dialog.Overlay>>(({ className, ...props }, ref) => (
  <Dialog.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-black/80', className)} {...props} />
));
SheetOverlay.displayName = Dialog.Overlay.displayName;

const SheetContent = React.forwardRef<React.ElementRef<typeof Dialog.Content>, React.ComponentPropsWithoutRef<typeof Dialog.Content> & { side?: 'left' | 'right' }>(
  ({ side = 'right', className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in',
          side === 'right' ? 'inset-y-0 right-0 h-full w-3/4 border-l-2 sm:max-w-sm' : 'inset-y-0 left-0 h-full w-3/4 border-r-2 sm:max-w-sm',
          className
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute right-4 top-4 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = Dialog.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col space-y-2', className)} {...props} />;
const SheetTitle = React.forwardRef<React.ElementRef<typeof Dialog.Title>, React.ComponentPropsWithoutRef<typeof Dialog.Title>>(({ className, ...props }, ref) => (
  <Dialog.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
));
SheetTitle.displayName = Dialog.Title.displayName;

export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
