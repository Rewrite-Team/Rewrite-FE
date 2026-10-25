import {
  WRITING_CREATE_STEPS,
  type WritingCreateStep,
  type WritingCreateInputStep,
} from '@/features/cover-letter/create-flow';
import { CheckIcon } from '@/shared/assets/icons/common';
import { cn } from '@/shared/styles/utils/cn';
import { COVER_LETTER_STEP_CONFIG } from '@/widgets/cover-letter-create/constants/stepConfig';

import { StepActionButton } from './StepActionButton';
import { stepConnectorVariants, stepIndicatorVariants } from './stepPanelVariants';

import type { StepPanelAction } from './types';

interface CoverLetterStepPanelBaseProps {
  className?: string;
  currentStep: WritingCreateStep;
  availableStep?: WritingCreateStep;
  errorSteps?: WritingCreateStep[];
  onStepSelect: (step: WritingCreateStep) => void;
}

type CoverLetterStepPanelProps = CoverLetterStepPanelBaseProps &
  (
    | {
        submitAction?: never;
        currentStep: WritingCreateInputStep;
        nextAction: StepPanelAction;
        saveDraftAction: StepPanelAction;
      }
    | {
        submitAction: StepPanelAction;
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
  currentStep: WritingCreateStep,
  availableStep: WritingCreateStep
): CoverLetterCreateStepStatus => {
  if (step === currentStep) return 'current';
  if (step < availableStep) return 'completed';

  return 'upcoming';
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
 * @param availableStep - 저장된 데이터로 진입할 수 있는 마지막 단계. 생략하면 현재 단계까지 허용합니다.
 * @param errorSteps - 서버 검증 오류가 남아 있어 빨간 번호로 표시할 단계
 * @param onStepSelect - 진행 단계 아이콘을 선택했을 때 실행할 콜백
 * @param nextAction - STEP1~3의 다음 버튼 상태와 동작
 * @param saveDraftAction - STEP1~3의 임시 저장 버튼 상태와 동작
 * @param submitAction - STEP4의 AI 첨삭 시작 버튼 상태와 동작
 */
export function CoverLetterStepPanel(props: CoverLetterStepPanelProps) {
  const {
    className,
    currentStep,
    availableStep = currentStep,
    errorSteps = [],
    onStepSelect,
  } = props;
  const isFinalStep = currentStep === 4;

  return (
    <div className={cn('contents lg:flex lg:flex-col lg:gap-3', className)}>
      <nav
        aria-label="자기소개서 등록 진행 단계"
        className="row-start-2 mt-6 flex h-24 min-w-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-800 lg:mt-0"
      >
        <ol className="flex h-12 w-67.5 items-start">
          {WRITING_CREATE_STEPS.map((step, index) => {
            const stepConfig = COVER_LETTER_STEP_CONFIG[`step${step}`];
            const stepStatus = getStepStatus(step, currentStep, availableStep);
            const isCompleted = stepStatus === 'completed';
            const hasError = errorSteps.includes(step);
            const nextStep = WRITING_CREATE_STEPS[index + 1];
            const nextStepStatus = nextStep
              ? getStepStatus(nextStep, currentStep, availableStep)
              : null;

            return (
              <li
                aria-current={stepStatus === 'current' ? 'step' : undefined}
                className={cn('relative flex h-12 items-start', nextStep ? 'w-20.5' : 'w-6')}
                key={step}
              >
                <button
                  aria-label={`${stepConfig.label} 단계로 이동${hasError ? ', 입력 오류 있음' : ''}`}
                  className={stepIndicatorVariants({ status: stepStatus, hasError })}
                  disabled={step === currentStep || step > availableStep}
                  onClick={() => onStepSelect(step)}
                  type="button"
                >
                  {isCompleted && !hasError ? <CheckIcon className="h-3 w-4" /> : step}
                </button>

                {nextStepStatus ? (
                  <span
                    aria-hidden
                    className={stepConnectorVariants({
                      startActive: stepStatus !== 'upcoming',
                      endActive: nextStepStatus !== 'upcoming',
                    })}
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

      <div className="row-start-4 mt-6 flex min-w-0 flex-col gap-2 lg:mt-0">
        {isFinalStep ? (
          <StepActionButton action={props.submitAction} className="h-11.25 w-full">
            AI 첨삭 시작
          </StepActionButton>
        ) : (
          <>
            <StepActionButton action={props.nextAction} className="h-11.25 w-full">
              다음
            </StepActionButton>
            <StepActionButton
              action={props.saveDraftAction}
              intent="save-draft"
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
