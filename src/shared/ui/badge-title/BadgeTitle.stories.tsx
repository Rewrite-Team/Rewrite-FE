import { BadgeTitle } from './BadgeTitle';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/BadgeTitle',
  component: BadgeTitle,
  args: {
    companyName: '회사명',
    jobName: '직무',
    title: '자기소개서 제목',
    titleAs: 'h2',
  },
  argTypes: {
    titleAs: {
      control: 'inline-radio',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
} satisfies Meta<typeof BadgeTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
