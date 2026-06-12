import SymbolLogo from './SymbolLogo';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/SymbolLogo',
  component: SymbolLogo,
  decorators: [
    (Story) => (
      <div className="bg-black p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SymbolLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: {
    className: 'h-14 w-18',
  },
};
