import { BadgeGroup } from './BadgeGroup';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/BadgeGroup',
  component: BadgeGroup,
  args: {
    companyName: '회사명',
    jobName: '직무',
  },
} satisfies Meta<typeof BadgeGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
  args: {
    companyName: '라인플러스',
    jobName: '프론트엔드 개발자',
  },
};
