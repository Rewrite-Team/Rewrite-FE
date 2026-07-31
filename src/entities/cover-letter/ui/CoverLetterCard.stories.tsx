import { CoverLetterCard } from './CoverLetterCard';

import type { CoverLetterDisplayStatus, CoverLetterSummary } from '../model/types';
import type { Meta, StoryObj } from '@storybook/nextjs';

const DISPLAY_STATUSES: CoverLetterDisplayStatus[] = [
  'WRITING',
  'REVIEWING',
  'REVIEWED',
  'REVIEW_FAILED',
];

const createCoverLetter = (
  displayStatus: CoverLetterDisplayStatus,
  index = 0
): CoverLetterSummary => ({
  id: `cl_${index + 1}`,
  title: '2026 상반기 백엔드 개발자 자기소개서',
  companyName: 'Rewrite Corp',
  positionTitle: '백엔드 개발자',
  displayStatus,
  createdAt: '2026-06-20T14:00:00',
  latestReviewedVersionId: displayStatus === 'REVIEWED' ? `rv_${index + 1}` : null,
});

const meta = {
  title: 'Entities/CoverLetter/CoverLetterCard',
  component: CoverLetterCard,
  args: {
    coverLetter: createCoverLetter('WRITING'),
  },
  render: (args) => (
    <ul className="m-0 w-90 list-none p-0">
      <CoverLetterCard {...args} />
    </ul>
  ),
} satisfies Meta<typeof CoverLetterCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Writing: Story = {};

export const Reviewing: Story = {
  args: {
    coverLetter: createCoverLetter('REVIEWING'),
  },
};

export const Reviewed: Story = {
  args: {
    coverLetter: createCoverLetter('REVIEWED'),
  },
};

export const ReviewFailed: Story = {
  args: {
    coverLetter: createCoverLetter('REVIEW_FAILED'),
  },
};

export const AllStatuses: Story = {
  render: () => (
    <ul className="m-0 grid w-180 list-none grid-cols-2 gap-6 p-0">
      {DISPLAY_STATUSES.map((displayStatus, index) => (
        <CoverLetterCard
          coverLetter={createCoverLetter(displayStatus, index)}
          key={displayStatus}
        />
      ))}
    </ul>
  ),
};
