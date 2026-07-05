import { Profile } from './Profile';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Entities/User/Profile',
  component: Profile,
  args: {
    name: '이서정',
    profileImageUrl: '/images/profile.png',
  },
} satisfies Meta<typeof Profile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
