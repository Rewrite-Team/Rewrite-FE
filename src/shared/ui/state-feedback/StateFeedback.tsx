'use client';

import { useId } from 'react';

import { cn } from '@/shared/styles/utils/cn';
import { Button } from '@/shared/ui/button';
import { LottieAnimation } from '@/shared/ui/lottie-animation';
import { Title } from '@/shared/ui/title';

import type { StateFeedbackProps } from './StateFeedback.types';

/**
 * ## StateFeedback
 *
 * @description
 * Lottie, 제목, 설명과 단일 버튼을 조합하는 범용 상태 안내 컴포넌트입니다.
 * 온보딩, 기능 시작, 작업 완료처럼 정해진 Empty/Error variant가 없는 화면에서 사용합니다.
 *
 * 상태별 기본 시각 요소와 의미가 필요한 경우에는 `EmptyState`, `ErrorState`를 우선 사용합니다.
 *
 * @example
 * ```tsx
 * <StateFeedback
 *   action={{ label: '모의면접 시작하기', onClick: handleStart }}
 *   animationData={interviewLottie}
 *   title="AI 면접을 지금 시작해보세요!"
 * />
 * ```
 */
export function StateFeedback({
  action,
  animationClassName,
  animationData,
  className,
  description,
  role,
  title,
  titleAs = 'h2',
  ...sectionProps
}: StateFeedbackProps) {
  const generatedId = useId();
  const titleId = `state-feedback-title-${generatedId}`;
  const descriptionId = description ? `state-feedback-description-${generatedId}` : undefined;
  let actionButton = null;

  if (action) {
    const { label, ...buttonProps } = action;

    actionButton = (
      <Button {...buttonProps} size="md">
        {label}
      </Button>
    );
  }

  return (
    <section
      {...sectionProps}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={cn(
        'flex min-h-80 w-full max-w-120 flex-col items-center justify-center px-6 py-8 text-center',
        className
      )}
      role={role}
    >
      {animationData ? (
        <div
          aria-hidden="true"
          className={cn('mb-5 size-48 shrink-0 overflow-hidden', animationClassName)}
        >
          <LottieAnimation animationData={animationData} className="size-full" />
        </div>
      ) : null}

      <Title as={titleAs} className="heading-24 font-semibold" id={titleId}>
        {title}
      </Title>

      {description ? (
        <p
          className="mt-2 mb-0 wrap-break-word body-16 font-normal whitespace-pre-line text-gray-100"
          id={descriptionId}
        >
          {description}
        </p>
      ) : null}

      {actionButton ? <div className="mt-6">{actionButton}</div> : null}
    </section>
  );
}
