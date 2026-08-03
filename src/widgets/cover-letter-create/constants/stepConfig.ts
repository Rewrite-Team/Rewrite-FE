import type { CoverLetterStepConfigBySegment } from '@/widgets/cover-letter-create/types/coverLetterCreate';

/** 각 라우트 STEP에서 표시할 제목, 설명, 진행 라벨을 정의합니다. */
export const COVER_LETTER_STEP_CONFIG = {
  step1: {
    description: '자기소개서 제목과 지원 회사, 직무 정보를 입력할 수 있습니다.',
    label: '직무 정보',
    step: 1,
    title: '내 자기소개서 등록',
  },
  step2: {
    description:
      '채용 공고의 우대사항을 입력해 AI가 맞춤형 자기소개서를 생성할 수 있도록 도와줍니다.',
    label: '우대사항',
    step: 2,
    title: '채용 우대사항 등록',
  },
  step3: {
    description: '자기소개서 문항과 답변을 작성할 수 있습니다.',
    label: '자기소개서 작성',
    step: 3,
    title: '자기소개서 작성',
  },
  step4: {
    description: '작성한 자기소개서를 확인하고 점검할 수 있습니다.',
    label: '완료',
    step: 4,
    title: '자기소개서 확인',
  },
} as const satisfies CoverLetterStepConfigBySegment;
