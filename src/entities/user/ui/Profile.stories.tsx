import { Profile } from './Profile';

import type { Meta, StoryObj } from '@storybook/nextjs';

const MOCK_PROFILE_IMAGE_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="15.5" fill="%23b7d6b5" stroke="white"/%3E%3C/svg%3E';

const meta = {
  title: 'Entities/User/Profile',
  component: Profile,
  args: {
    name: '이서정',
    profileImageUrl: MOCK_PROFILE_IMAGE_URL,
  },
} satisfies Meta<typeof Profile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
