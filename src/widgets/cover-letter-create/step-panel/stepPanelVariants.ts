import { cva } from 'class-variance-authority';

/** 단계의 진행 상태와 서버 검증 오류를 번호 버튼 스타일로 표현합니다. */
export const stepIndicatorVariants = cva(
  'relative z-(--z-index-local-overlay) flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm leading-none font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 disabled:cursor-default',
  {
    variants: {
      status: {
        completed: '',
        current: 'border border-white',
        upcoming: '',
      },
      hasError: {
        true: 'bg-error-500',
        false: '',
      },
    },
    compoundVariants: [
      { status: ['completed', 'current'], hasError: false, class: 'bg-primary-500' },
      { status: 'upcoming', hasError: false, class: 'bg-gray-500' },
    ],
    defaultVariants: { hasError: false },
  }
);

/** 양쪽 단계의 진행 여부에 따라 연결선의 색과 그라데이션 방향을 결정합니다. */
export const stepConnectorVariants = cva('mt-3 h-px w-14.5 shrink-0', {
  variants: {
    startActive: { true: '', false: '' },
    endActive: { true: '', false: '' },
  },
  compoundVariants: [
    { startActive: true, endActive: true, class: 'bg-primary-500' },
    {
      startActive: true,
      endActive: false,
      class: 'bg-linear-to-r from-primary-500 to-gray-500',
    },
    {
      startActive: false,
      endActive: true,
      class: 'bg-linear-to-r from-gray-500 to-primary-500',
    },
    { startActive: false, endActive: false, class: 'bg-gray-500' },
  ],
});
