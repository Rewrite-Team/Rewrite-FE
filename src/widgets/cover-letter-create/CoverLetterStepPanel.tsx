import { FINAL_COVER_LETTER_CREATE_STEP } from '@/features/cover-letter/create-flow';
import { CheckIcon } from '@/shared/assets/icons/common';
import type { WritingCreateStep } from '@/shared/constants/routes';
import { cn } from '@/shared/styles/utils/cn';

import { COVER_LETTER_CREATE_STEPS } from './coverLetterCreateStepConfig';
import { StepActionButton, type StepPanelAction } from './StepActionButton';

interface CoverLetterStepPanelBaseProps {
  className?: string;
  currentStep: WritingCreateStep;
  highestCompletedStep: WritingCreateStep | null;
  onStepSelect: (step: WritingCreateStep) => void;
}

type CoverLetterStepPanelProps = CoverLetterStepPanelBaseProps &
  (
    | {
        completeAction?: never;
        currentStep: Exclude<WritingCreateStep, typeof FINAL_COVER_LETTER_CREATE_STEP>;
        nextAction: StepPanelAction;
        saveDraftAction: StepPanelAction;
      }
    | {
        completeAction: StepPanelAction;
        currentStep: typeof FINAL_COVER_LETTER_CREATE_STEP;
        nextAction?: never;
        saveDraftAction?: never;
      }
  );

const getConnectorClassName = (
  startStep: WritingCreateStep,
  endStep: WritingCreateStep,
  currentStep: WritingCreateStep,
  highestCompletedStep: WritingCreateStep | null
) => {
  const isActiveStep = (step: WritingCreateStep) =>
    step === currentStep || (highestCompletedStep !== null && step <= highestCompletedStep);
  const isStartStepActive = isActiveStep(startStep);
  const isEndStepActive = isActiveStep(endStep);

  if (isStartStepActive && isEndStepActive) return 'bg-primary-500';
  if (isStartStepActive) return 'bg-gradient-to-r from-primary-500 to-gray-500';
  if (isEndStepActive) return 'bg-gradient-to-r from-gray-500 to-primary-500';

  return 'bg-gray-500';
};

/**
 * ## CoverLetterStepPanel
 *
 * @description
 * 자기소개서 등록 STEP1~4의 진행 상태와 단계별 액션을 표시하는 공통 패널입니다.
 * 완료한 단계는 체크 표시로, 현재 단계는 흰색 테두리가 있는 숫자로 구분합니다.
 *
 * ### 접근성
 *
 * 진행 상태는 이름이 있는 `nav`와 순서가 있는 목록으로 제공하며, 현재 단계에는
 * `aria-current="step"`을 적용합니다.
 *
 * @param currentStep - 현재 표시 중인 등록 단계
 * @param onStepSelect - 진행 단계 아이콘을 선택했을 때 실행할 콜백
 * @param nextAction - STEP1~3의 다음 버튼 상태와 동작
 * @param saveDraftAction - STEP1~3의 임시 저장 버튼 상태와 동작
 * @param completeAction - STEP4의 완료 버튼 상태와 동작
 */
export function CoverLetterStepPanel(props: CoverLetterStepPanelProps) {
  const { className, currentStep, highestCompletedStep, onStepSelect } = props;
  const isFinalStep = currentStep === FINAL_COVER_LETTER_CREATE_STEP;

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <nav
        aria-label="자기소개서 등록 진행 단계"
        className="flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-800"
      >
        <ol className="flex h-12 w-67.5 items-start">
          {COVER_LETTER_CREATE_STEPS.map((stepConfig, index) => {
            const isCompleted =
              highestCompletedStep !== null && stepConfig.step <= highestCompletedStep;
            const isCurrent = stepConfig.step === currentStep;
            const nextStepConfig = COVER_LETTER_CREATE_STEPS[index + 1];

            return (
              <li
                aria-current={isCurrent ? 'step' : undefined}
                className={cn('relative flex h-12 items-start', nextStepConfig ? 'w-20.5' : 'w-6')}
                key={stepConfig.step}
              >
                <button
                  aria-label={`${stepConfig.label} 단계로 이동`}
                  className={cn(
                    'relative z-10 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm leading-none font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 disabled:cursor-default',
                    isCompleted || isCurrent ? 'bg-primary-500' : 'bg-gray-500',
                    isCurrent && 'border border-white'
                  )}
                  disabled={isCurrent || !isCompleted}
                  onClick={() => onStepSelect(stepConfig.step)}
                  type="button"
                >
                  {isCompleted ? <CheckIcon className="h-3 w-4" /> : stepConfig.step}
                </button>

                {nextStepConfig ? (
                  <span
                    aria-hidden
                    className={cn(
                      'mt-3 h-px w-14.5 shrink-0',
                      getConnectorClassName(
                        stepConfig.step,
                        nextStepConfig.step,
                        currentStep,
                        highestCompletedStep
                      )
                    )}
                  />
                ) : null}

                <span className="absolute top-9 left-3 -translate-x-1/2 text-[10px] leading-3 font-normal whitespace-nowrap text-white">
                  {stepConfig.label}
                </span>
                <span className="sr-only">
                  {stepConfig.step}단계 {isCompleted ? '완료' : isCurrent ? '현재 단계' : '진행 전'}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex flex-col gap-2">
        {isFinalStep ? (
          <StepActionButton action={props.completeAction} className="h-11.25 w-full">
            완료
          </StepActionButton>
        ) : (
          <>
            <StepActionButton action={props.nextAction} className="h-11.25 w-full">
              다음
            </StepActionButton>
            <StepActionButton
              action={props.saveDraftAction}
              className="w-full border-2 border-gray-400"
              variant="secondary"
            >
              임시 저장
            </StepActionButton>
          </>
        )}
      </div>
    </div>
  );
}
