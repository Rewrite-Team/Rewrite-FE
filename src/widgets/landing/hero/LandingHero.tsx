import type { CSSProperties } from 'react';

import { ArrowRightCircleIcon } from '@/shared/assets/icons/common';
import { ROUTES } from '@/shared/constants/routes';
import { LinkButton } from '@/shared/ui/button';

import styles from './LandingHero.module.css';

interface ScatteredCharacterStyle extends CSSProperties {
  '--character-delay': string;
  '--scatter-rotate': string;
  '--scatter-x': string;
  '--scatter-y': string;
}

interface AnimatedHeadlineProps {
  lineIndex: number;
  text: string;
}

const HEADLINE_LINES = [
  '당신의 이야기가 경쟁력이 되는 순간',
  'AI 자기소개서 첨삭과 실전 면접 연습을 한 곳에서',
] as const;

const SCATTER_POSITIONS = [
  ['-42vw', '-31vh', '-32deg'],
  ['31vw', '-37vh', '24deg'],
  ['-29vw', '33vh', '41deg'],
  ['38vw', '26vh', '-18deg'],
  ['-14vw', '-42vh', '16deg'],
  ['17vw', '39vh', '-45deg'],
  ['-47vw', '12vh', '29deg'],
  ['44vw', '-8vh', '-26deg'],
  ['-8vw', '36vh', '38deg'],
  ['24vw', '-28vh', '-14deg'],
  ['-35vw', '-4vh', '20deg'],
  ['11vw', '30vh', '-36deg'],
] as const;

const getCharacterStyle = (characterIndex: number, lineIndex: number): ScatteredCharacterStyle => {
  const positionIndex = (characterIndex * 7 + lineIndex * 5) % SCATTER_POSITIONS.length;
  const [x, y, rotation] = SCATTER_POSITIONS[positionIndex];

  return {
    '--character-delay': `${lineIndex * 110 + (characterIndex % 9) * 34}ms`,
    '--scatter-rotate': rotation,
    '--scatter-x': x,
    '--scatter-y': y,
  };
};

function AnimatedHeadline({ lineIndex, text }: AnimatedHeadlineProps) {
  return (
    <span aria-hidden className={styles.headlineLine}>
      {Array.from(text).map((character, characterIndex) => (
        <span
          className={styles.character}
          key={`${lineIndex}-${characterIndex}`}
          style={getCharacterStyle(characterIndex, lineIndex)}
        >
          {character === ' ' ? '\u00a0' : character}
        </span>
      ))}
    </span>
  );
}

export function LandingHero() {
  return (
    <section
      aria-labelledby="landing-hero-title"
      className={styles.hero}
      data-layout-content="full-bleed"
      data-layout-header="overlay"
    >
      <div className={styles.brandArea}>
        <p className={styles.brand}>Re:write</p>
      </div>

      <div className={styles.content}>
        <div className={`${styles.insightCard} ${styles.insightCardTop}`}>
          <span>예상 질문 생성</span>
          <strong>자기소개서 기반 실전 면접</strong>
        </div>

        <h1 className={styles.headline} id="landing-hero-title">
          <span className="sr-only">{HEADLINE_LINES.join(' ')}</span>
          {HEADLINE_LINES.map((line, lineIndex) => (
            <AnimatedHeadline key={line} lineIndex={lineIndex} text={line} />
          ))}
        </h1>

        <div className={`${styles.insightCard} ${styles.insightCardBottom}`}>
          <span>AI 첨삭 리포트</span>
          <strong>문장·논리·직무 역량 분석</strong>
        </div>

        <LinkButton className={styles.cta} href={ROUTES.LOGIN} size="md" variant="ghost">
          <span>
            <strong>카카오 로그인</strong>으로 바로 시작하기
          </span>
          <ArrowRightCircleIcon aria-hidden className={styles.ctaArrow} focusable={false} />
        </LinkButton>
      </div>
    </section>
  );
}
