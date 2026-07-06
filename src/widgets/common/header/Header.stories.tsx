import { DefaultProfileImage } from '@/shared/assets/images';
import { ROUTES } from '@/shared/constants/routes';

import { Header } from './Header';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Widgets/Common/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-120 bg-black text-white">
        <Story />
        <main className="mx-auto flex max-w-320 flex-col gap-4 px-5 py-12 md:px-8">
          <h1 className="heading-32 font-semibold">Header Preview</h1>
          <p className="body-16 max-w-180 text-gray-100">
            스크롤 시 Header 배경과 blur가 적용됩니다. Storybook에서는 Scrolled 스토리로 상태를
            고정해서 확인할 수 있습니다.
          </p>
          <div className="h-120 rounded-lg border border-white/10 bg-gray-900" />
        </main>
      </div>
    ),
  ],
  args: {
    authenticatedLogoHref: ROUTES.WRITING,
    loginHref: ROUTES.LOGIN,
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Guest: Story = {};

export const GuestScrolled: Story = {
  args: {
    isBackgroundBlurred: true,
  },
};

export const LoggedIn: Story = {
  args: {
    user: {
      name: '이서정',
      profileImageUrl: DefaultProfileImage.src,
    },
  },
};

export const LoggedInScrolled: Story = {
  args: {
    isBackgroundBlurred: true,
    user: {
      name: '이서정',
      profileImageUrl: DefaultProfileImage.src,
    },
  },
};
