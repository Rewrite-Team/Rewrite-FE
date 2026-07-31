'use client';

import dynamic from 'next/dynamic';

const LottiePlayer = dynamic(() => import('react-lottie-player'), { ssr: false });

interface LottieAnimationData {
  assets?: unknown[];
  fr: number;
  h: number;
  ip: number;
  layers: unknown[];
  nm?: string;
  op: number;
  v: string;
  w: number;
}

interface LottieAnimationProps {
  animationData: LottieAnimationData;
  className?: string;
  loop?: boolean;
  play?: boolean;
}

/**
 * Lottie JSON 데이터를 클라이언트에서 재생하는 공통 애니메이션 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <LottieAnimation animationData={interviewLottie} className="size-56" />
 * ```
 */
export function LottieAnimation({
  animationData,
  className,
  loop = true,
  play = true,
}: LottieAnimationProps) {
  return (
    <LottiePlayer
      animationData={animationData}
      className={className}
      loop={loop}
      play={play}
      renderer="svg"
    />
  );
}
