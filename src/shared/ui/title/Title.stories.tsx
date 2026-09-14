import { Title } from './Title';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/Title',
  component: Title,
  args: {
    as: 'h1',
    children: '자기소개서 작성 경험을 다시 쓰다',
    className: 'heading-48',
  },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
  decorators: [
    (Story) => (
      <div className="min-w-160 p-8 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Title>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllLevels: Story = {
  render: () => (
    <section className="flex flex-col gap-5">
      <Title as="h1" className="heading-48">
        h1 페이지 대표 제목
      </Title>
      <Title as="h2" className="heading-40">
        h2 주요 섹션 제목
      </Title>
      <Title as="h3" className="heading-32">
        h3 하위 섹션 제목
      </Title>
      <Title as="h4" className="heading-24">
        h4 콘텐츠 그룹 제목
      </Title>
      <Title as="h5" className="heading-18">
        h5 세부 항목 제목
      </Title>
      <Title as="h6" className="body-16">
        h6 보조 제목
      </Title>
    </section>
  ),
};

export const CustomClassName: Story = {
  args: {
    children: '강조 색상을 적용한 제목',
    as: 'h2',
    className: 'text-primary-500',
  },
};
