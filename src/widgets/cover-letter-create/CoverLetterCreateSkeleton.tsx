import type { WritingCreateStep } from '@/features/cover-letter/create-flow';
import { cn } from '@/shared/styles/utils/cn';
import { Skeleton } from '@/shared/ui/skeleton';

interface CoverLetterCreateSkeletonProps {
  currentStep: WritingCreateStep;
}

const STEP_BLOCK_CLASSES = {
  1: ['h-36', 'h-104'],
  2: ['h-113'],
  3: ['h-104', 'h-12'],
  4: ['h-36', 'h-104', 'h-113', 'h-104'],
} satisfies Record<WritingCreateStep, string[]>;

/** 서버 데이터를 기다리는 동안 등록 단계의 입력 영역을 표시합니다. */
export function CoverLetterCreateSkeleton({ currentStep }: CoverLetterCreateSkeletonProps) {
  return (
    <div aria-busy="true" role="status">
      <span className="sr-only">자기소개서 내용을 불러오는 중입니다.</span>
      <div aria-hidden="true" className="flex min-w-0 flex-col gap-12">
        {STEP_BLOCK_CLASSES[currentStep].map((className, index) => (
          <Skeleton className={cn(className, 'rounded-2xl')} key={index} />
        ))}
      </div>
    </div>
  );
}
