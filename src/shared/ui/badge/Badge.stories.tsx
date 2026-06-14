import Badge from './Badge';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/Badge',
  component: Badge,
  args: {
    children: '회사명',
    variant: 'company',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['company', 'job'],
    },
  },
  decorators: [
    (Story) => (
      <div className="min-w-160 bg-black p-8 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Company: Story = {};

export const Job: Story = {
  args: {
    children: '직무',
    variant: 'job',
  },
};

export const Variants: Story = {
  render: () => (
    <section className="flex flex-wrap items-center gap-2">
      <Badge variant="company">회사명</Badge>
      <Badge variant="job">직무</Badge>
    </section>
  ),
};

export const LongText: Story = {
  render: () => (
    <section className="flex max-w-80 flex-wrap items-center gap-2">
      <Badge variant="company">라인플러스</Badge>
      <Badge variant="job">프론트엔드 개발자</Badge>
    </section>
  ),
};
