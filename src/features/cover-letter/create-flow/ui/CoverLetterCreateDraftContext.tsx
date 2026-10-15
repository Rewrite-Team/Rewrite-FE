'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';

import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

import type { CoverLetterValidationFieldError } from '../model/mapCoverLetterValidationErrors';
import type { WritingCreateStep } from '../model/writingCreateStep';

interface CoverLetterCreateDraftProviderProps {
  children: ReactNode;
  draft: CoverLetterDetailResponse;
}

interface DraftContextValue {
  draft: CoverLetterDetailResponse;
  errors: CoverLetterValidationFieldError[];
  setErrors: Dispatch<SetStateAction<CoverLetterValidationFieldError[]>>;
  dirtyStep: WritingCreateStep | null;
  setDirtyStep: Dispatch<SetStateAction<WritingCreateStep | null>>;
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
  const [dirtyStep, setDirtyStep] = useState<WritingCreateStep | null>(null);
  const value = useMemo(
    () => ({ draft, errors, setErrors, dirtyStep, setDirtyStep }),
    [draft, errors, dirtyStep]
  );
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

/**
 * ## useCoverLetterStepDirty
 *
 * @description
 * React Hook Form의 isDirty를 단계 패널에 전달해 임시 저장 버튼 상태를 결정합니다.
 * 페이지 이탈 시 해당 단계의 변경 표시를 해제하며, Provider가 없으면 공유하지 않습니다.
 *
 * @example
 * ```tsx
 * useCoverLetterStepDirty(1, isDirty);
 * ```
 */
export function useCoverLetterStepDirty(step: WritingCreateStep, isDirty: boolean) {
  const setDirtyStep = useContext(CoverLetterCreateDraftContext)?.setDirtyStep;

  useEffect(() => {
    if (!setDirtyStep) return;
    setDirtyStep(isDirty ? step : null);
    // 이전 페이지의 변경 상태가 새 단계의 버튼을 활성화하지 않도록 정리합니다.
    return () => setDirtyStep((current) => (current === step ? null : current));
  }, [isDirty, setDirtyStep, step]);
}

/**
 * ## useCoverLetterCreateDirtyStep
 *
 * @description
 * 현재 표시 중인 폼에서 저장되지 않은 변경이 있는 단계를 반환합니다.
 * 변경이 없거나 Provider가 없으면 null을 반환합니다.
 *
 * @example
 * ```tsx
 * const dirtyStep = useCoverLetterCreateDirtyStep();
 * const canSaveDraft = dirtyStep === currentStep;
 * ```
 */
export const useCoverLetterCreateDirtyStep = () =>
  useContext(CoverLetterCreateDraftContext)?.dirtyStep ?? null;
