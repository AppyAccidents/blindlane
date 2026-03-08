import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center border-2 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider transition-colors', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-foreground',
      hook: 'border-transparent bg-highlight-hook text-slate-900',
      impact: 'border-transparent bg-highlight-impact text-slate-900',
      cta: 'border-transparent bg-highlight-cta text-slate-900',
      anthropic: 'border-transparent bg-provider-anthropic text-white',
      openai: 'border-transparent bg-provider-openai text-white',
      google: 'border-transparent bg-provider-google text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
