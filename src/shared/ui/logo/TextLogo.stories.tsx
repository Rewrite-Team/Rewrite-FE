import TextLogo from './TextLogo';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/TextLogo',
  component: TextLogo,
  args: {
    as: 'div',
    isLoggedIn: false,
  },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['h1', 'div'],
    },
    isLoggedIn: {
      control: 'boolean',
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

export const Guest: Story = {};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
  },
};

export const LandingHeading: Story = {
  args: {
    as: 'h1',
  },
};
