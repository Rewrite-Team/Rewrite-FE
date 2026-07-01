import { Button, LinkButton } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: {
    children: '저장하기',
    size: 'md',
    variant: 'primary',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'outline'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    children: '임시 저장',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'AI 첨삭 다시 받기',
    variant: 'ghost',
  },
};

export const Outline: Story = {
  args: {
    children: '문항 추가',
    variant: 'outline',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">적용</Button>
      <Button size="md">다음</Button>
      <Button size="lg">저장하기</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    children: '저장하기',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: '다음',
    disabled: true,
  },
};

export const IconOnly: Story = {
  args: {
    'aria-label': '업로드',
    children: '+',
    iconOnly: true,
    variant: 'outline',
  },
};

export const InternalLink: Story = {
  render: () => (
    <LinkButton href="/writing" variant="outline">
      자기소개서 목록
    </LinkButton>
  ),
};

export const ExternalLink: Story = {
  render: () => (
    <LinkButton
      external
      href="https://github.com/Rewrite-Team/Rewrite-FE"
      target="_blank"
      variant="secondary"
    >
      GitHub로 이동
    </LinkButton>
  ),
};
