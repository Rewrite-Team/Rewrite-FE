'use client';

import { useEffect, useEffectEvent } from 'react';

import { useCoverLetterCreateValidation } from '../ui/CoverLetterCreateDraftContext';

import type { CoverLetterValidationFieldError } from '../model/mapCoverLetterValidationErrors';

type StepFieldError<Step extends 1 | 2 | 3> = Extract<
  CoverLetterValidationFieldError,
  { step: Step }
>;

interface StepErrorsOptions<Step extends 1 | 2 | 3> {
  step: Step;
  applyError: (error: StepFieldError<Step>) => void;
  focusError: (error: StepFieldError<Step>) => void | (() => void);
}

/**
 * ## useCoverLetterStepErrors
 *
 * @description
 * 저장·최종 제출에서 Context에 기록한 서버 오류를 현재 단계 폼에 한 번 적용합니다.
 * 다음 프레임에 첫 오류로 포커스를 옮기며 문항 오류는 가장 앞 문항을 우선합니다.
 * focusError는 문항 펼치기처럼 화면별 준비를 담당하며 예약한 작업의 취소 함수를 반환할 수 있습니다.
 *
 * @example
 * ```tsx
 * useCoverLetterStepErrors({
 *   step: 1,
 *   applyError: (error) => setError(error.field, { type: 'server', message: error.reason }),
 *   focusError: (error) => setFocus(error.field),
 * });
 * ```
 */
export function useCoverLetterStepErrors<Step extends 1 | 2 | 3>({
  step,
  applyError,
  focusError,
}: StepErrorsOptions<Step>) {
  const { errors } = useCoverLetterCreateValidation();
  const applyFieldError = useEffectEvent(applyError);
  const focusFirstError = useEffectEvent(focusError);

  useEffect(() => {
    const stepErrors = errors
      .filter((error): error is StepFieldError<Step> => error.step === step)
      .sort(
        (first, second) =>
          ('index' in first ? first.index : 0) - ('index' in second ? second.index : 0)
      );
    if (stepErrors.length === 0) return;
    for (const error of stepErrors) applyFieldError(error);
    let cancelFocus: void | (() => void);
    const frame = requestAnimationFrame(() => {
      cancelFocus = focusFirstError(stepErrors[0]);
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelFocus?.();
    };
  }, [errors, step]);
}
