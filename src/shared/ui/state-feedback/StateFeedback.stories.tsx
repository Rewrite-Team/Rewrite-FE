import { interviewLottie } from '@/shared/assets/lotties';

import { EmptyState, ErrorState, StateFeedback } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/StateFeedback',
  parameters: {
    docs: {
      description: {
        component:
          '데이터가 없거나 오류가 발생한 상황을 동일한 레이아웃으로 안내합니다. EmptyState와 ErrorState는 각각 기본 Lottie와 md 크기의 단일 버튼 API를 제공합니다.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Empty: Story = {
  render: () => (
    <EmptyState
      action={{ label: '자기소개서 작성', onClick: () => undefined }}
      description="첫 자기소개서를 작성하고 AI 첨삭을 시작해 보세요."
      title="작성한 자기소개서가 없어요"
    />
  ),
};

export const Error: Story = {
  render: () => (
    <ErrorState
      description={'네트워크 연결을 확인한 뒤\n잠시 후 다시 시도해 주세요.'}
      retry={{ onClick: () => undefined }}
      title="자기소개서를 불러오지 못했어요"
    />
  ),
};

export const CustomButton: Story = {
  render: () => (
    <ErrorState
      description="잠시 후 다시 불러와 주세요."
      retry={{
        label: '다시 불러오기',
        onClick: () => undefined,
        variant: 'secondary',
      }}
      title="일시적인 오류가 발생했어요"
    />
  ),
};

export const WithoutDescriptionOrAction: Story = {
  render: () => <EmptyState title="표시할 알림이 없어요" />,
};

export const InterviewStart: Story = {
  render: () => (
    <StateFeedback
      action={{ label: '모의면접 시작하기', onClick: () => undefined }}
      animationClassName="size-56"
      animationData={interviewLottie}
      className="max-w-130"
      title="AI 면접을 지금 시작해보세요!"
    />
  ),
};
