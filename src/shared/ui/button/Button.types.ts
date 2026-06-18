import type { ReactNode } from 'react';

interface ButtonStateProps {
  children: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

type ButtonAccessibilityProps =
  | {
      'aria-label': string;
      iconOnly: true;
    }
  | {
      'aria-label'?: string;
      iconOnly?: false;
    };

export type { ButtonAccessibilityProps, ButtonStateProps };
