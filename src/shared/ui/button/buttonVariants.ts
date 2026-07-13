import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium',
    'transition-colors duration-150 select-none whitespace-nowrap',
    'focus-ring',
    'data-[loading=true]:cursor-wait',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary-500 text-white data-[disabled=false]:hover:bg-primary-600 data-[disabled=false]:active:bg-primary-700 disabled:bg-gray-700 aria-disabled:cursor-not-allowed aria-disabled:bg-gray-700',
        secondary:
          'border border-gray-300 bg-black text-white data-[disabled=false]:hover:bg-gray-900 data-[disabled=false]:active:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500 aria-disabled:cursor-not-allowed aria-disabled:border-gray-600 aria-disabled:text-gray-500',
        ghost:
          'border border-transparent bg-transparent text-white data-[disabled=false]:hover:text-primary-500 data-[disabled=false]:active:text-primary-600 disabled:text-gray-500 aria-disabled:cursor-not-allowed aria-disabled:text-gray-500',
        outline:
          'border border-primary-500 bg-transparent text-primary-500 data-[disabled=false]:hover:bg-primary-300/50 data-[disabled=false]:active:bg-primary-300/60 disabled:border-gray-500 disabled:text-gray-500 aria-disabled:cursor-not-allowed aria-disabled:border-gray-500 aria-disabled:text-gray-500',
      },
      size: {
        sm: 'h-7 w-16 body-14',
        md: 'h-11 w-88 body-14',
        lg: 'h-12 w-133 body-16',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export { buttonVariants };
export type { ButtonVariantProps };
