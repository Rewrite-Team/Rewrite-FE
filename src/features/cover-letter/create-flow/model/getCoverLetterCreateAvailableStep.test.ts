import type { CoverLetterDetailResponse, QuestionResponse } from '@/entities/cover-letter';

import { getCoverLetterCreateAvailableStep } from './getCoverLetterCreateAvailableStep';

const createDraft = (): CoverLetterDetailResponse => ({
  coverLetter: {
    id: 'draft-id',
    displayStatus: 'WRITING',
    title: null,
    companyName: null,
    positionTitle: null,
    jobPostingUrl: null,
    preferences: null,
  },
  questions: [],
  reviewVersion: null,
  reviewJob: null,
});

const createQuestion = (): QuestionResponse => ({
  questionId: 'question-id',
  questionResultId: null,
  order: 1,
  question: '지원 동기는?',
  originalAnswer: '지원 동기입니다.',
  maxAnswerLength: null,
  originalAnswerLength: null,
  aiReport: null,
  rewrittenAnswer: null,
  rewrittenAnswerLength: null,
  finalAnswer: null,
  finalAnswerLength: null,
});

const completeBasicInfo = (draft: CoverLetterDetailResponse) => {
  Object.assign(draft.coverLetter, {
    title: '자기소개서',
    companyName: '회사',
    positionTitle: '개발자',
  });
};

describe('getCoverLetterCreateAvailableStep', () => {
  it('빈 초안은 STEP1까지만 허용한다', () => {
    expect(getCoverLetterCreateAvailableStep(createDraft())).toBe(1);
  });

  it('기본 정보를 완성하면 STEP2까지 허용한다', () => {
    const draft = createDraft();
    completeBasicInfo(draft);
    expect(getCoverLetterCreateAvailableStep(draft)).toBe(2);
  });

  it('공백 우대사항은 STEP2를 완료한 것으로 처리하지 않는다', () => {
    const draft = createDraft();
    completeBasicInfo(draft);
    draft.coverLetter.preferences = '   ';
    expect(getCoverLetterCreateAvailableStep(draft)).toBe(2);
  });

  it('우대사항을 완성해도 문항이 없으면 STEP3까지만 허용한다', () => {
    const draft = createDraft();
    completeBasicInfo(draft);
    draft.coverLetter.preferences = 'React 경험';
    expect(getCoverLetterCreateAvailableStep(draft)).toBe(3);
  });

  it('뒤쪽 문항의 답변이 미완성이면 STEP4를 허용하지 않는다', () => {
    const draft = createDraft();
    completeBasicInfo(draft);
    draft.coverLetter.preferences = 'React 경험';
    draft.questions = [
      createQuestion(),
      { ...createQuestion(), questionId: 'second', order: 2, originalAnswer: null },
    ];
    expect(getCoverLetterCreateAvailableStep(draft)).toBe(3);
  });

  it('선택 항목 없이 필수값이 완성되면 STEP4까지 허용한다', () => {
    const draft = createDraft();
    completeBasicInfo(draft);
    draft.coverLetter.preferences = 'React 경험';
    draft.questions = [createQuestion()];
    expect(getCoverLetterCreateAvailableStep(draft)).toBe(4);
  });

  it('뒤쪽 단계가 저장되어 있어도 기본 정보가 미완성이면 STEP1을 반환한다', () => {
    const draft = createDraft();
    draft.coverLetter.preferences = 'React 경험';
    draft.questions = [createQuestion()];
    expect(getCoverLetterCreateAvailableStep(draft)).toBe(1);
  });
});
