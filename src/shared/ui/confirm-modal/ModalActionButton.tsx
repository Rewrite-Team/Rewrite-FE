import type { ComponentProps } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@/shared/styles/utils/cn';
import { Button } from '@/shared/ui/button';

const modalActionButtonVariants = cva('w-full min-w-0', {
  variants: {
    variant: {
      primary: '',
      secondary:
        'bg-gray-800 data-[disabled=false]:hover:bg-gray-900 data-[disabled=false]:active:bg-black',
      ghost: '',
      outline: '',
    },
  },
});

/** 모달 액션의 너비와 배경색을 통일하며, 보조 버튼은 모달 표면과 같은 배경을 사용합니다. */
export function ModalActionButton({
  className,
  variant = 'primary',
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn(modalActionButtonVariants({ variant }), className)}
      variant={variant}
    />
  );
}
