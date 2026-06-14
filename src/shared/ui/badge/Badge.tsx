import type { ComponentPropsWithoutRef } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/styles/utils/cn';

const badgeVariants = cva(
  'inline-flex max-w-full shrink-0 items-center rounded-full border px-2 h-4.5 body-12 font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        company: 'border-yellow-500 bg-yellow-50 text-yellow-500',
        job: 'border-primary-500 bg-primary-50 text-primary-500',
      },
    },
    defaultVariants: {
      variant: 'company',
    },
  }
);

interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'children'>, VariantProps<typeof badgeVariants> {
  children: string;
}

export default function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
