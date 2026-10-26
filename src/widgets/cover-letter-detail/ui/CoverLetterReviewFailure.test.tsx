import { fireEvent, render, screen } from '@testing-library/react';

import type { QuestionResponse } from '@/entities/cover-letter';

import { CoverLetterReviewFailure } from './CoverLetterReviewFailure';

jest.mock('@/shared/ui/lottie-animation', () => ({ LottieAnimation: () => null }));
jest.mock('@/shared/assets/icons/common', () => ({
  AlertCircleIcon: () => null,
  AltArrowDownIcon: () => null,
  CheckMarkIcon: () => null,
}));

const QUESTIONS: QuestionResponse[] = [
  {
    questionResultId: 'result-1',
    questionId: 'question-1',
    order: 1,
    question: '완료된 질문',
    originalAnswer: '완료된 답변',
    originalAnswerLength: 5,
    maxAnswerLength: 700,
    aiReport: '첨삭 의견',
    rewrittenAnswer: '첨삭 답변',
    rewrittenAnswerLength: 5,
    finalAnswer: '최종 답변',
    finalAnswerLength: 5,
  },
  {
    questionResultId: null,
    questionId: 'question-2',
    order: 2,
    question: '실패한 질문',
    originalAnswer: '실패한 답변',
    originalAnswerLength: 5,
    maxAnswerLength: 700,
    aiReport: null,
    rewrittenAnswer: null,
    rewrittenAnswerLength: null,
    finalAnswer: null,
    finalAnswerLength: null,
  },
];

describe('CoverLetterReviewFailure', () => {
  const scrollIntoView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  it('닫힌 실패 문항을 연 다음 펼침 전환이 끝나면 같은 위치로 스크롤한다', () => {
    const { container } = render(
      <CoverLetterReviewFailure
        isFetching={false}
        onRefresh={jest.fn()}
        questions={QUESTIONS}
        questionResults={[]}
        title="자기소개서"
      />
    );
    const trigger = screen.getByRole('button', { name: '2번 자기소개서 문항 접기 또는 펼치기' });
    const failedQuestion = container.querySelector<HTMLElement>('#cover-letter-question-2');
    const failedQuestionRegion = failedQuestion?.querySelector('[role="region"]');

    expect(failedQuestionRegion).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('link', { name: '2번' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.transitionEnd(failedQuestionRegion!, { propertyName: 'grid-template-rows' });

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
