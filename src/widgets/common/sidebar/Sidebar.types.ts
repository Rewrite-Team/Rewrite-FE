import type { ComponentPropsWithoutRef } from 'react';

type SidebarVariant = 'compact' | 'full';

interface SidebarProps extends ComponentPropsWithoutRef<'aside'> {
  writingId: string;
  onDelete?: () => void;
  onVersionClick?: () => void;
  pathname?: string;
  variant?: SidebarVariant;
}

export type { SidebarProps, SidebarVariant };
