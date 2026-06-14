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
