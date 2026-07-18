import { Pagination } from './Pagination';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/Pagination',
  component: Pagination,
  args: {
    currentPage: 1,
    pathname: '/writing',
    totalPages: 10,
  },
  argTypes: {
    currentPage: {
      control: { min: 1, type: 'number' },
    },
    totalPages: {
      control: { min: 1, type: 'number' },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
  },
};

export const WithoutEllipsis: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
  },
};
