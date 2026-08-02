import type { WritingCreateStep } from '@/shared/constants/routes';

interface CoverLetterCreateStepConfig {
  description: string;
  label: string;
  step: WritingCreateStep;
  title: string;
}

/** 각 라우트 STEP에서 표시할 제목, 설명, 진행 라벨을 정의합니다. */
export const COVER_LETTER_CREATE_STEP_CONFIG = {
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
} as const satisfies Record<`step${WritingCreateStep}`, CoverLetterCreateStepConfig>;

/** 진행 패널 렌더링에 사용하는 순서가 보장된 STEP 표시 설정 목록입니다. */
export const COVER_LETTER_CREATE_STEPS = Object.values(COVER_LETTER_CREATE_STEP_CONFIG);

/** 자기소개서 등록 라우트에서 허용하는 STEP 세그먼트입니다. */
export type CoverLetterCreateStepSegment = keyof typeof COVER_LETTER_CREATE_STEP_CONFIG;

/**
 * 선택된 라우트 세그먼트가 자기소개서 등록 STEP인지 확인합니다.
 *
 * @param segment - 현재 선택된 App Router 세그먼트
 */
export const isCoverLetterCreateStepSegment = (
  segment: string | null
): segment is CoverLetterCreateStepSegment =>
  segment !== null && Object.hasOwn(COVER_LETTER_CREATE_STEP_CONFIG, segment);
