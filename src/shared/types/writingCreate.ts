import { WRITING_CREATE_STEPS } from '@/shared/constants/writingCreate';

/** 자기소개서 등록 라우트에서 허용하는 STEP입니다. */
export type WritingCreateStep = (typeof WRITING_CREATE_STEPS)[number];
