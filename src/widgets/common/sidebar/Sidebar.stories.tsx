import { expect, fn, userEvent, within } from 'storybook/test';

import { Sidebar } from './Sidebar';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Widgets/Common/Sidebar',
  component: Sidebar,
  parameters: { layout: 'centered' },
  args: {
    onDelete: fn(),
    onVersionClick: fn(),
    writingId: '1',
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WritingDetail: Story = {
  args: { pathname: '/writing/1' },
};

export const KeywordAnalysis: Story = {
  args: { pathname: '/writing/1/keyword-analysis' },
};

export const AiInterview: Story = {
  args: { pathname: '/writing/1/interview' },
};

export const Interactions: Story = {
  args: { pathname: '/writing/1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const analysisTrigger = canvas.getByRole('button', { name: '자기소개서 분석' });

    await userEvent.click(analysisTrigger);
    await expect(analysisTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'AI 첨삭' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: '키워드 분석' })).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect(analysisTrigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(canvas.getByRole('button', { name: '사이드바 펼치기' }));
    await expect(canvas.getByRole('button', { name: '메뉴 접기' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: '버전 관리' }));
    await expect(meta.args.onVersionClick).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole('button', { name: '자기소개서 삭제' }));
    await expect(meta.args.onDelete).toHaveBeenCalledOnce();
  },
};
