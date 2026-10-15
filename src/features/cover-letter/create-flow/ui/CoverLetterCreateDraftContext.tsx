'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';

import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

import type { CoverLetterValidationFieldError } from '../model/mapCoverLetterValidationErrors';

interface CoverLetterCreateDraftProviderProps {
  children: ReactNode;
  draft: CoverLetterDetailResponse;
}

interface DraftContextValue {
  draft: CoverLetterDetailResponse;
  errors: CoverLetterValidationFieldError[];
  setErrors: Dispatch<SetStateAction<CoverLetterValidationFieldError[]>>;
}

const EMPTY_VALIDATION: Pick<DraftContextValue, 'errors' | 'setErrors'> = {
  errors: [],
  setErrors: () => undefined,
};
const CoverLetterCreateDraftContext = createContext<DraftContextValue | null>(null);

/**
 * ## CoverLetterCreateDraftProvider
 *
 * @description
 * 작성 단계의 공통 레이아웃에서 조회한 임시 저장 데이터와 서버 검증 오류를 공유합니다.
 * 최종 제출 오류로 이전 단계에 이동해도 대상 폼이 오류를 복원할 수 있도록
 * 단계 페이지보다 상위에서 유지합니다. 단계별 오류는 해당 단계 저장에 성공하면 제거합니다.
 *
 * @example
 * ```tsx
 * <CoverLetterCreateDraftProvider draft={draft}>
 *   {children}
 * </CoverLetterCreateDraftProvider>
 * ```
 */
export function CoverLetterCreateDraftProvider({
  children,
  draft,
}: CoverLetterCreateDraftProviderProps) {
  const [errors, setErrors] = useState<CoverLetterValidationFieldError[]>([]);
  const value = useMemo(() => ({ draft, errors, setErrors }), [draft, errors]);
  return (
    <CoverLetterCreateDraftContext.Provider value={value}>
      {children}
    </CoverLetterCreateDraftContext.Provider>
  );
}

/**
 * ## useCoverLetterCreateDraft
 *
 * @description
 * 작성 폼의 초기값과 최종 확인 화면에 사용할 서버 임시 저장 데이터를 반환합니다.
 * Provider가 없으면 null을 반환하므로 소비하는 폼은 빈 초기값을 처리해야 합니다.
 *
 * @example
 * ```tsx
 * const draft = useCoverLetterCreateDraft();
 * const title = draft?.coverLetter.title ?? '';
 * ```
 */
export const useCoverLetterCreateDraft = () =>
  useContext(CoverLetterCreateDraftContext)?.draft ?? null;
/**
 * ## useCoverLetterCreateValidation
 *
 * @description
 * 최종 제출에서 받은 단계별 오류를 저장하거나 대상 폼과 단계 패널에서 표시할 때 사용합니다.
 * 대상 폼은 자기 단계의 오류를 복원하고, 저장 성공 시에만 해당 단계의 오류를 제거합니다.
 * Provider가 없으면 errors는 빈 배열이며 setErrors는 상태를 변경하지 않습니다.
 *
 * @example
 * ```tsx
 * const { errors, setErrors } = useCoverLetterCreateValidation();
 * const hasStepError = errors.some((error) => error.step === currentStep);
 * ```
 */
export const useCoverLetterCreateValidation = () =>
  useContext(CoverLetterCreateDraftContext) ?? EMPTY_VALIDATION;
