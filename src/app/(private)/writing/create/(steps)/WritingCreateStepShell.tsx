'use client';

import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/constants/routes';
import { WRITING_CREATE_STEPS } from '@/shared/constants/writingCreate';
import type { WritingCreateStep } from '@/shared/types/writingCreate';
import { PageHeader } from '@/shared/ui/page-header';
import {
  COVER_LETTER_STEP_CONFIG,
  CoverLetterStepPanel,
  type CoverLetterCreateStepSegment,
} from '@/widgets/cover-letter-create';

interface WritingCreateStepShellProps {
  children: ReactNode;
  currentStepSegment: CoverLetterCreateStepSegment;
}

/**
 * 선택된 STEP의 헤더, 진행 패널, 페이지 폼 영역을 공통 레이아웃으로 조립합니다.
 * 퍼블리싱 단계에서는 현재 라우트를 기준으로 이전 STEP과 다음 STEP 이동만 제공합니다.
 *
 * @param children - 현재 STEP 페이지의 폼 콘텐츠
 * @param currentStepSegment - 현재 STEP의 라우트 세그먼트
 */
export function WritingCreateStepShell({
  children,
  currentStepSegment,
}: WritingCreateStepShellProps) {
  const router = useRouter();
  const { description, step, title } = COVER_LETTER_STEP_CONFIG[currentStepSegment];
  const currentStepIndex = WRITING_CREATE_STEPS.indexOf(step);
  const nextStep = WRITING_CREATE_STEPS[currentStepIndex + 1];

  // TODO: API 연결 시 서버의 WRITING 진행 상태와 저장 결과를 기준으로 이동 가능 STEP을 결정한다.
  const handleNext = () => {
    if (nextStep === undefined) return;

    router.push(ROUTES.WRITING_CREATE_STEP(nextStep));
  };

  const handleStepSelect = (targetStep: WritingCreateStep) => {
    if (targetStep >= step) return;

    router.push(ROUTES.WRITING_CREATE_STEP(targetStep));
  };

  const stepPanel =
    step === 4 ? (
      <CoverLetterStepPanel
        completeAction={
          // TODO: 최종 등록 API가 준비되면 완료 mutation과 로딩·오류 처리를 연결한다.
          { status: 'disabled' }
        }
        currentStep={step}
        onStepSelect={handleStepSelect}
      />
    ) : (
      <CoverLetterStepPanel
        currentStep={step}
        nextAction={{ onClick: handleNext, status: 'enabled' }}
        onStepSelect={handleStepSelect}
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
