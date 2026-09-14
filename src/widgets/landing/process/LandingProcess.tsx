'use client';

import { useEffect, useRef } from 'react';

import styles from './LandingProcess.module.css';

const PROCESS_STEPS = [
  '자기소개서를 확인 중입니다...',
  'AI 첨삭이 진행 중입니다...',
  '키워드 분석 중입니다...',
  'AI 면접을 생성하고 있습니다...',
] as const;

export function LandingProcess() {
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
        const guide = section.querySelector<HTMLElement>(`.${styles.guide}`);
        const guideDot = section.querySelector<HTMLElement>(`.${styles.guideDot}`);
        const ambientLight = section.querySelector<HTMLElement>(`.${styles.ambientLight}`);
        const bubbles = gsap.utils.toArray<HTMLElement>(`.${styles.bubble}`, section);

        if (!guide || !guideDot || !ambientLight) {
          return;
        }

        const ambientTweens = [
          gsap.to(ambientLight, {
            xPercent: 4,
            yPercent: -2,
            scale: 1.06,
            opacity: 1,
            duration: 5.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            paused: true,
          }),
          gsap.to(guideDot, {
            scale: 1.35,
            opacity: 0.72,
            duration: 1.6,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            paused: true,
          }),
          ...bubbles.flatMap((bubble, index) => [
            gsap.to(bubble, {
              y: -6,
              duration: 3.1 + index * 0.25,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              paused: true,
            }),
            gsap.to(bubble, {
              backgroundPosition: '0% 50%',
              duration: 4.5 + index * 0.35,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              paused: true,
            }),
          ]),
        ];

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              once: true,
            },
            onComplete: () => {
              ambientTweens.forEach((tween) => tween.play());
            },
          })
          .fromTo(
            guide,
            { autoAlpha: 0, scaleY: 0 },
            { autoAlpha: 1, scaleY: 1, duration: 0.7, ease: 'power3.out' }
          )
          .fromTo(
            guideDot,
            { autoAlpha: 0, scale: 0 },
            { autoAlpha: 1, scale: 1, duration: 0.38, ease: 'back.out(2)' },
            '-=0.16'
          )
          .fromTo(
            bubbles,
            {
              autoAlpha: 0,
              x: (index) => (index % 2 === 0 ? -52 : 52),
              y: 18,
              scale: 0.93,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 1.05,
              ease: 'power3.out',
              stagger: 0.28,
            },
            '-=0.05'
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
    <section ref={sectionRef} aria-labelledby="landing-process-title" className={styles.section}>
      <h2 className={styles.srOnly} id="landing-process-title">
        Re:write AI 분석 과정
      </h2>

      <div className={styles.scene}>
        <span aria-hidden className={styles.ambientLight} />
        <span aria-hidden className={styles.guide}>
          <span className={styles.guideDot} />
        </span>

        <ol className={styles.steps}>
          {PROCESS_STEPS.map((step) => (
            <li className={styles.bubble} key={step}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
