'use client';

import type { ReactNode } from 'react';

import {
  FINAL_COVER_LETTER_CREATE_STEP,
  useCoverLetterCreateFlow,
} from '@/features/cover-letter/create-flow';
import { PageHeader } from '@/shared/ui/page-header';
import {
  COVER_LETTER_CREATE_STEP_CONFIG,
  CoverLetterStepPanel,
} from '@/widgets/cover-letter-create';

interface WritingCreateStepsContentProps {
  children: ReactNode;
  selectedSegment: keyof typeof COVER_LETTER_CREATE_STEP_CONFIG;
}

/**
 * 선택된 STEP의 헤더, 진행 패널, 페이지 폼 영역을 공통 레이아웃으로 조립합니다.
 * 접근할 수 없는 STEP은 Provider의 경로 교정이 끝날 때까지 렌더링하지 않습니다.
 *
 * @param children - 현재 STEP 페이지의 폼 콘텐츠
 * @param selectedSegment - 현재 선택된 STEP 라우트 세그먼트
 */
export function WritingCreateStepsContent({
  children,
  selectedSegment,
}: WritingCreateStepsContentProps) {
  const { highestCompletedStep, isCurrentStepAccessible, navigateNext, navigateToStep } =
    useCoverLetterCreateFlow();
  const { description, step, title } = COVER_LETTER_CREATE_STEP_CONFIG[selectedSegment];

  if (!isCurrentStepAccessible) return null;

  const stepPanel =
    step === FINAL_COVER_LETTER_CREATE_STEP ? (
      <CoverLetterStepPanel
        completeAction={
          // TODO: 최종 등록 API가 준비되면 완료 mutation과 로딩·오류 처리를 연결한다.
          { status: 'disabled' }
        }
        currentStep={step}
        highestCompletedStep={highestCompletedStep}
        onStepSelect={navigateToStep}
      />
    ) : (
      <CoverLetterStepPanel
        currentStep={step}
        highestCompletedStep={highestCompletedStep}
        nextAction={{ onClick: navigateNext, status: 'enabled' }}
        onStepSelect={navigateToStep}
        saveDraftAction={
          // TODO: STEP별 임시 저장 API가 준비되면 폼 검증과 저장 mutation을 연결한다.
          { status: 'disabled' }
        }
      />
    );

  return (
    <div className="grid w-full grid-cols-1 items-start lg:grid-cols-[minmax(0,728fr)_minmax(16rem,352fr)] lg:gap-x-7.5">
      <PageHeader className="lg:col-start-1" description={description} title={title} />

      <aside
        aria-label="자기소개서 등록 진행 및 작업"
        className="mt-6 flex min-w-0 flex-col gap-3 lg:col-start-2 lg:row-start-2 lg:mt-9"
      >
        {stepPanel}
      </aside>

      <div className="mt-9 flex min-w-0 flex-col gap-12 lg:col-start-1 lg:row-start-2">
        {children}
      </div>
    </div>
  );
}
