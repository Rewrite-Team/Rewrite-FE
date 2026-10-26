import type { QuestionResponse } from '@/entities/cover-letter';
import type { ReviewQuestionSnapshot } from '@/entities/llm-job';

import { CoverLetterReviewProgress } from './CoverLetterReviewProgress';

import type { Meta, StoryObj } from '@storybook/nextjs';

const questions = [
  {
    questionResultId: 'result-1',
    questionId: 'question-1',
    order: 1,
    question: '지원 동기와 해당 직무에 관심을 갖게 된 계기를 작성해 주세요.',
    maxAnswerLength: 700,
    originalAnswer:
      '주문 서비스 개발에 관심을 갖게 된 계기를 작성했습니다. 여러 사용자의 요청이 안정적으로 처리되는 과정에 흥미를 느꼈습니다.',
    originalAnswerLength: 81,
    aiReport: null,
    rewrittenAnswer: null,
    rewrittenAnswerLength: null,
    finalAnswer: null,
    finalAnswerLength: null,
  },
  {
    questionResultId: 'result-2',
    questionId: 'question-2',
    order: 2,
    question: '문제를 해결하기 위해 노력했던 경험을 작성해 주세요.',
    maxAnswerLength: 700,
    originalAnswer:
      '팀 프로젝트에서 발생한 문제를 분석하고 팀원과 함께 해결 방안을 찾은 경험을 작성했습니다.',
    originalAnswerLength: 53,
    aiReport: null,
    rewrittenAnswer: null,
    rewrittenAnswerLength: null,
    finalAnswer: null,
    finalAnswerLength: null,
  },
] satisfies QuestionResponse[];

const partialResults = [
  {
    questionId: 'question-1',
    order: 1,
    aiReport:
      '지원 동기와 경험의 연결이 명확합니다. 본인의 역할과 결과를 구체적인 수치로 보완하면 설득력이 높아집니다.',
    rewrittenAnswer:
      '주문 서비스 개발에 관심을 갖게 된 계기는 사용자의 요청이 안정적으로 처리되는 과정을 직접 경험한 것입니다.',
  },
] satisfies ReviewQuestionSnapshot[];

const handleRefresh = () => undefined;

const meta = {
  title: 'Widgets/CoverLetterDetail/ReviewProgress',
  component: CoverLetterReviewProgress,
  args: {
    title: '2026 상반기 백엔드 개발자 자기소개서',
    questions,
    questionResults: [],
    hasJobId: true,
    isCompleted: false,
    isFetching: false,
    onRefresh: handleRefresh,
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="mx-auto min-h-screen w-full max-w-275 py-8 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CoverLetterReviewProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WaitingForResults: Story = {
  args: {
    progress: { current: 0, total: 2, message: '문항별 첨삭을 준비하고 있어요.' },
  },
};

export const PartialResults: Story = {
  args: {
    progress: { current: 1, total: 2, message: '두 번째 문항을 첨삭하고 있어요.' },
    questionResults: partialResults,
  },
};

export const Completed: Story = {
  args: {
    progress: { current: 2, total: 2, message: '첨삭 결과를 정리하고 있어요.' },
    questionResults: partialResults,
    isCompleted: true,
  },
};

export const ConnectionIssue: Story = {
  args: {
    connectionIssue: '첨삭 작업 정보를 확인하지 못했습니다.',
  },
};
