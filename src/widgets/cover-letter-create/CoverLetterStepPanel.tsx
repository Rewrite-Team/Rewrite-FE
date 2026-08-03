import { CheckIcon } from '@/shared/assets/icons/common';
import { WRITING_CREATE_STEPS } from '@/shared/constants/writingCreate';
import { cn } from '@/shared/styles/utils/cn';
import type { WritingCreateStep } from '@/shared/types/writingCreate';
import { COVER_LETTER_STEP_CONFIG } from '@/widgets/cover-letter-create/constants/stepConfig';
import { StepActionButton } from '@/widgets/cover-letter-create/StepActionButton';
import type { StepPanelAction } from '@/widgets/cover-letter-create/types/coverLetterCreate';

interface CoverLetterStepPanelBaseProps {
  className?: string;
  currentStep: WritingCreateStep;
  onStepSelect: (step: WritingCreateStep) => void;
}

type CoverLetterStepPanelProps = CoverLetterStepPanelBaseProps &
  (
    | {
        completeAction?: never;
        currentStep: Exclude<WritingCreateStep, 4>;
        nextAction: StepPanelAction;
        saveDraftAction: StepPanelAction;
      }
    | {
        completeAction: StepPanelAction;
        currentStep: 4;
        nextAction?: never;
        saveDraftAction?: never;
      }
  );

type CoverLetterCreateStepStatus = 'completed' | 'current' | 'upcoming';

const STEP_STATUS_LABEL = {
  completed: '완료',
  current: '현재 단계',
  upcoming: '진행 전',
} as const satisfies Record<CoverLetterCreateStepStatus, string>;

const getStepStatus = (
  step: WritingCreateStep,
  currentStep: WritingCreateStep
): CoverLetterCreateStepStatus => {
  if (step === currentStep) return 'current';
  if (step < currentStep) return 'completed';

  return 'upcoming';
};

const getConnectorClassName = (
  startStepStatus: CoverLetterCreateStepStatus,
  endStepStatus: CoverLetterCreateStepStatus
) => {
  const isStartStepActive = startStepStatus !== 'upcoming';
  const isEndStepActive = endStepStatus !== 'upcoming';

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
  const { className, currentStep, onStepSelect } = props;
  const isFinalStep = currentStep === 4;

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <nav
        aria-label="자기소개서 등록 진행 단계"
        className="flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-800"
      >
        <ol className="flex h-12 w-67.5 items-start">
          {WRITING_CREATE_STEPS.map((step, index) => {
            const stepConfig = COVER_LETTER_STEP_CONFIG[`step${step}`];
            const stepStatus = getStepStatus(step, currentStep);
            const isCompleted = stepStatus === 'completed';
            const nextStep = WRITING_CREATE_STEPS[index + 1];
            const nextStepStatus = nextStep ? getStepStatus(nextStep, currentStep) : null;

            return (
              <li
                aria-current={stepStatus === 'current' ? 'step' : undefined}
                className={cn('relative flex h-12 items-start', nextStep ? 'w-20.5' : 'w-6')}
                key={step}
              >
                <button
                  aria-label={`${stepConfig.label} 단계로 이동`}
                  className={cn(
                    'relative z-10 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm leading-none font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 disabled:cursor-default',
                    stepStatus !== 'upcoming' ? 'bg-primary-500' : 'bg-gray-500',
                    stepStatus === 'current' && 'border border-white'
                  )}
                  disabled={!isCompleted}
                  onClick={() => onStepSelect(step)}
                  type="button"
                >
                  {isCompleted ? <CheckIcon className="h-3 w-4" /> : step}
                </button>

                {nextStepStatus ? (
                  <span
                    aria-hidden
                    className={cn(
                      'mt-3 h-px w-14.5 shrink-0',
                      getConnectorClassName(stepStatus, nextStepStatus)
                    )}
                  />
                ) : null}

                <span className="absolute top-9 left-3 -translate-x-1/2 text-[10px] leading-3 font-normal whitespace-nowrap text-white">
                  {stepConfig.label}
                </span>
                <span className="sr-only">
                  {step}단계 {STEP_STATUS_LABEL[stepStatus]}
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
