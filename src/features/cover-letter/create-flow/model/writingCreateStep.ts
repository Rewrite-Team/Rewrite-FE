/** 자기소개서 등록 흐름에서 사용하는 순서가 보장된 STEP 목록입니다. */
export const WRITING_CREATE_STEPS = [1, 2, 3, 4] as const;

/** 자기소개서 등록 흐름에서 허용하는 STEP입니다. */
export type WritingCreateStep = (typeof WRITING_CREATE_STEPS)[number];
