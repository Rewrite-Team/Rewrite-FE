import { DefaultProfileImage } from '@/shared/assets/images';

import { Profile } from './Profile';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Entities/User/Profile',
  component: Profile,
  args: {
    name: '이서정',
    profileImageUrl: DefaultProfileImage.src,
  },
} satisfies Meta<typeof Profile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fallback: Story = {
  args: {
    profileImageUrl: '/invalid-profile-image.png',
  },
};
