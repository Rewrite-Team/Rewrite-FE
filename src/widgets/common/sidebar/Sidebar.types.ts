import type { ComponentPropsWithoutRef } from 'react';

type SidebarVariant = 'contextual' | 'detail';

interface SidebarProps extends ComponentPropsWithoutRef<'aside'> {
  writingId: string;
  pathname?: string;
  variant?: SidebarVariant;
  onDelete: () => void;
  onVersionClick: () => void;
}

export type { SidebarProps, SidebarVariant };
