import PageHeader from './PageHeader';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  args: {
    title: '자기소개서 목록',
    description: '작성한 자기소개서를 확인하고 새로운 자기소개서를 등록할 수 있습니다.',
  },
  decorators: [
    (Story) => (
      <div className="min-w-160 bg-black p-8 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongDescription: Story = {
  args: {
    title: 'AI 면접 연습',
    description:
      '자기소개서를 기반으로 생성된 예상 질문에 답변하며 실제 면접 전에 답변 흐름과 핵심 키워드를 점검할 수 있습니다.',
  },
};

export const CustomLayout: Story = {
  args: {
    title: '키워드 분석 결과',
    description: '지원 직무와 관련된 핵심 키워드가 자기소개서에 충분히 반영되었는지 확인합니다.',
    className: 'max-w-180 gap-4',
    titleClassName: 'text-primary-500',
    descriptionClassName: 'body-18 text-gray-100',
  },
};
