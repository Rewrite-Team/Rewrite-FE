import type { ComponentProps, ComponentPropsWithoutRef, MouseEventHandler } from 'react';

import type { Button } from '@/shared/ui/button';
import type { LottieAnimation } from '@/shared/ui/lottie-animation';

type StateFeedbackTitleElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type StateFeedbackAnimationData = ComponentProps<typeof LottieAnimation>['animationData'];

type StateFeedbackSectionProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'aria-describedby' | 'aria-labelledby' | 'children' | 'dangerouslySetInnerHTML' | 'role' | 'title'
>;

type StateFeedbackButtonOptions = Pick<
  ComponentProps<typeof Button>,
  'className' | 'disabled' | 'isLoading' | 'variant'
>;

interface StateFeedbackActionProps extends StateFeedbackButtonOptions {
  /** 버튼에 표시할 문구입니다. */
  label: string;
  /** 버튼 클릭 시 호출됩니다. */
  onClick: MouseEventHandler<HTMLButtonElement>;
}

interface StateFeedbackBaseProps extends StateFeedbackSectionProps {
  /** Lottie 영역의 크기와 여백을 확장할 클래스입니다. */
  animationClassName?: string;
  /** 표시할 Lottie JSON 데이터입니다. null이면 Lottie 영역을 숨깁니다. */
  animationData?: StateFeedbackAnimationData | null;
  /** 상태를 이해하는 데 필요한 보조 설명입니다. */
  description?: string;
  /** 상태를 요약하는 필수 제목입니다. */
  title: string;
  /** 문서 구조에 맞춰 사용할 제목 태그입니다. */
  titleAs?: StateFeedbackTitleElement;
}

interface StateFeedbackProps extends StateFeedbackBaseProps {
  /** 상태 안내 아래에 표시할 단일 버튼 설정입니다. */
  action?: StateFeedbackActionProps;
  role?: 'alert' | 'status';
}

interface EmptyStateProps extends StateFeedbackBaseProps {
  /** 상태 안내 아래에 표시할 단일 버튼 설정입니다. */
  action?: StateFeedbackActionProps;
}

interface ErrorStateRetryProps extends Omit<StateFeedbackActionProps, 'label'> {
  /** 재시도 버튼 문구입니다. */
  label?: string;
}

interface ErrorStateProps extends StateFeedbackBaseProps {
  /** 재시도 버튼 설정입니다. */
  retry?: ErrorStateRetryProps;
}

export type { EmptyStateProps, ErrorStateProps, StateFeedbackProps };
