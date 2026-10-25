'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/constants/routes';
import { appToast } from '@/shared/lib/toast';

import {
  useCoverLetterCreateValidation,
  useCoverLetterCreateSaveControl,
} from '../ui/CoverLetterCreateDraftContext';

import type { WritingCreateStep } from '../model/writingCreateStep';

interface CoverLetterStepSaveOptions<Values> {
  coverLetterId: string;
  currentStep: Exclude<WritingCreateStep, 4>;
  isDirty: boolean;
  clearErrors: () => void;
  getValues: () => Values;
  saveDraft: (values: Values) => Promise<unknown>;
  onSaved: (values: Values) => void;
  validateDraft?: (values: Values) => boolean;
}

/**
 * ## useCoverLetterStepSave
 *
 * @description
 * STEP1~3의 중복 저장 방지와 저장 후 이동을 처리합니다.
 * 반환 함수의 intent가 'draft'이면 저장 완료 토스트를, 'next'이면 다음 단계 이동을 수행합니다.
 * currentStep으로 저장·오류 처리 대상을 지정하며, 다음 단계는 currentStep + 1로 계산합니다.
 *
 * ### 주의할 점
 * 다음 단계의 필수값 검증은 호출하는 폼의 handleSubmit에서 먼저 수행합니다.
 * isDirty가 false인 다음 단계 이동은 검증 후 저장 요청 없이 수행합니다.
 * validateDraft는 임시 저장과 다음 단계 이동 모두에 적용할 추가 검증이며,
 * false를 반환하면 API 요청을 중단합니다. 필드 오류 표시는 해당 콜백에서 처리합니다.
 * 저장 실패 안내와 서버 검증 오류 기록은 각 mutation의 onError에서 처리합니다.
 * useCoverLetterStepErrors는 Context에 기록된 오류를 폼에 적용합니다.
 * 요청 데이터 변환은 saveDraft에서 담당합니다.
 * onSaved에는 저장에 성공한 입력값을 전달하므로 폼의 변경 비교 기준을 갱신할 수 있습니다.
 * getValues로 현재 폼의 임시 저장 액션을 등록하며, 저장 성공 여부를 반환해 단계 이동을 결정합니다.
 *
 * @example
 * ```tsx
 * const saveStep = useCoverLetterStepSave(options);
 * // 다음 단계는 폼 필수값 검증 후 호출합니다.
 * const onValidSubmit = (values: FormValues) => saveStep(values, { intent: 'next' });
 * const saveDraft = () => saveStep(getValues(), { intent: 'draft' });
 * ```
 */
export function useCoverLetterStepSave<Values>({
  coverLetterId,
  currentStep,
  isDirty,
  clearErrors,
  getValues,
  saveDraft,
  onSaved,
  validateDraft,
}: CoverLetterStepSaveOptions<Values>) {
  const router = useRouter();
  const isSavingRef = useRef(false);
  const { setErrors } = useCoverLetterCreateValidation();
  const { registerSaveDraft, setSavingIntent } = useCoverLetterCreateSaveControl();
  const nextStepRoute = ROUTES.WRITING_CREATE_STEP(coverLetterId, currentStep + 1);

  const saveStep = async (values: Values, { intent }: { intent: 'draft' | 'next' }) => {
    if (isSavingRef.current) return false;
    isSavingRef.current = true;
    try {
      clearErrors();
      if (validateDraft && !validateDraft(values)) return false;
      if (intent === 'next' && !isDirty) {
        router.push(nextStepRoute);
        return true;
      }
      setSavingIntent?.(intent);
      await saveDraft(values);
      onSaved(values);
      // 오류가 있는 단계를 방문해도 표시는 유지하고, 저장에 성공했을 때 해제합니다.
      setErrors((errors) => errors.filter((error) => error.step !== currentStep));
      if (intent === 'next') {
        router.push(nextStepRoute);
      } else {
        appToast.success('임시 저장되었습니다.');
      }
      return true;
    } catch {
      // mutation의 onError가 실패를 안내하며, 호출부에는 이동하지 않도록 결과만 전달합니다.
      return false;
    } finally {
      isSavingRef.current = false;
      setSavingIntent?.(null);
    }
  };

  // 매 렌더의 최신 저장 핸들러를 등록하고, 단계 이탈 시 이전 액션을 해제합니다.
  useEffect(() => registerSaveDraft?.(() => saveStep(getValues(), { intent: 'draft' })));

  return saveStep;
}
