'use client';

import { useEffect, useRef } from 'react';

import styles from './LandingClosing.module.css';

export function LandingClosing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let cancelled = false;
    let animationContext: { revert: () => void } | undefined;

    async function setupAnimation() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled || !section) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      animationContext = gsap.context(() => {
        const filledLines = gsap.utils.toArray<HTMLElement>(`.${styles.filledLine}`, section);

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 78%',
              end: 'top 8%',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            filledLines,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1,
              ease: 'none',
              stagger: 1,
            }
          );
      }, section);
    }

    void setupAnimation();

    return () => {
      cancelled = true;
      animationContext?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="landing-closing-title" className={styles.section}>
      <h2
        aria-label="막막했던 자기소개서와 면접 준비, 이제 혼자 고민하지 않아도 괜찮습니다. Re:write와 함께 나의 강점이 잘 드러나는 답변을 완성해보세요."
        className={styles.message}
        id="landing-closing-title"
      >
        <span aria-hidden className={styles.line}>
          <span className={styles.mutedLine}>
            막막했던 자기소개서와 면접 준비, 이제 혼자 고민하지 않아도 괜찮습니다.
          </span>
          <span className={styles.filledLine}>
            <span className={styles.accent}>막막했던 자기소개서와 면접 준비,</span> 이제{' '}
            <span className={styles.accent}>혼자 고민하지 않아도 괜찮습니다.</span>
          </span>
        </span>
        <span aria-hidden className={styles.line}>
          <span className={styles.mutedLine}>
            Re:write와 함께 나의 강점이 잘 드러나는 답변을 완성해보세요.
          </span>
          <span className={styles.filledLine}>
            <span className={styles.accent}>Re:write</span>와 함께{' '}
            <span className={styles.accent}>나의 강점이 잘 드러나는 답변</span>을 완성해보세요.
          </span>
        </span>
      </h2>
    </section>
  );
}
