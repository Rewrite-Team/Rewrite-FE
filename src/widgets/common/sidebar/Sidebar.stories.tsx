import { expect, userEvent, within } from 'storybook/test';

import { Sidebar } from './Sidebar';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Widgets/Common/Sidebar',
  component: Sidebar,
  parameters: { layout: 'centered' },
  args: {
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

export const AIInterview: Story = {
  args: { pathname: '/writing/1/interview' },
};

export const Interactions: Story = {
  args: { pathname: '/writing/1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const analysisTrigger = canvas.getByRole('button', { name: '자기소개서 분석' });

    analysisTrigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(analysisTrigger).toHaveAttribute('aria-expanded', 'true');
    const detailLink = canvas.getByRole('link', { name: 'AI 첨삭' });
    const keywordLink = canvas.getByRole('link', { name: '키워드 분석' });

    await expect(detailLink).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(keywordLink).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(detailLink).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(keywordLink).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(analysisTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(analysisTrigger).toHaveFocus();

    const sidebarTrigger = canvas.getByRole('button', { name: '사이드바 펼치기' });

    await expect(sidebarTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(sidebarTrigger);
    await expect(canvas.getByRole('button', { name: '메뉴 접기' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  },
};
