import { CoverLetterCreateLayout } from './CoverLetterCreateLayout';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Widgets/CoverLetterCreate/Layout',
  component: CoverLetterCreateLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-black px-5 py-15 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-277.5">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof CoverLetterCreateLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex min-h-72 items-center justify-center rounded-2xl bg-gray-800 px-6 text-gray-100">
        STEP별 콘텐츠 영역
      </div>
    ),
    description: '자기소개서 제목과 지원 회사, 직무 정보를 입력할 수 있습니다.',
    sidebar: (
      <>
        <div className="flex min-h-24 items-center justify-center rounded-2xl bg-gray-800 px-6 text-gray-100">
          진행 단계 영역
        </div>
        <div className="flex min-h-20 items-center justify-center rounded-lg border border-gray-300 px-6 text-gray-100">
          단계별 액션 영역
        </div>
      </>
    ),
    title: '내 자기소개서 등록',
  },
};

export const LongContent: Story = {
  args: {
    children: (
      <div className="flex min-h-180 items-center justify-center rounded-2xl bg-gray-800 px-6 text-gray-100">
        여러 문항이 포함된 긴 콘텐츠 영역
      </div>
    ),
    description: '작성한 자기소개서 전체 내용을 확인하고 제출할 수 있습니다.',
    sidebar: (
      <>
        <div className="flex min-h-24 items-center justify-center rounded-2xl bg-gray-800 px-6 text-gray-100">
          진행 단계 영역
        </div>
        <div className="flex min-h-11 items-center justify-center rounded-lg bg-primary-500 px-6 text-white">
          완료 액션 영역
        </div>
      </>
    ),
    title: '자기소개서 확인',
  },
};
