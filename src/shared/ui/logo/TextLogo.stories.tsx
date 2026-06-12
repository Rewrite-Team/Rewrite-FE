import { ROUTES } from '@/shared/constants/routes';

import TextLogo from './TextLogo';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/TextLogo',
  component: TextLogo,
  args: {
    'aria-label': '랜딩 페이지로 이동',
    as: 'div',
    href: ROUTES.LANDING,
  },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['h1', 'div'],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-8 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LandingLink: Story = {};

export const WritingLink: Story = {
  args: {
    'aria-label': '자기소개서 목록으로 이동',
    href: ROUTES.WRITING,
  },
};

export const LandingHeading: Story = {
  args: {
    as: 'h1',
  },
};
