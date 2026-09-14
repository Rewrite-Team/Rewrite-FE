'use client';

import { useEffect, useRef } from 'react';

import Image from 'next/image';

import { InterviewImage } from '@/shared/assets/images';

import styles from './LandingFeatures.module.css';

const FEATURES = [
  {
    title: 'AI 첨삭',
    description: [
      '자기소개서의 문장과 논리, 직무 적합도를 AI가 세밀하게 분석합니다.',
      '강점은 더 선명하게, 부족한 부분은 구체적인 방향과 함께 확인해보세요.',
    ],
  },
  {
    title: '버전 저장',
    description: [
      '수정 전후의 자기소개서를 버전별로 보관하고 비교할 수 있습니다.',
      '여러 번 다듬은 과정까지 놓치지 않고 가장 만족스러운 답변을 선택해보세요.',
    ],
  },
  {
    title: '키워드 분석',
    description: [
      '버블 클라우드 차트로 핵심 역량과 직무 관련 키워드를 한눈에 확인합니다.',
      '반복되는 표현과 강조할 강점을 발견해 더 설득력 있게 완성해보세요.',
    ],
  },
  {
    title: 'AI 면접',
    description: [
      '자기소개서를 바탕으로 예상 질문을 만들고 실전처럼 답변을 연습합니다.',
      '이어지는 꼬리 질문과 피드백으로 나만의 답변 흐름을 준비해보세요.',
    ],
  },
] as const;

const FEATURE_SCREEN_KEYS = ['primary', 'secondary'] as const;

export function LandingFeatures() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let cancelled = false;
    let animationContext: { revert: () => void } | undefined;

    const setupAnimation = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled || !section) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      animationContext = gsap.context(() => {
        const heading = section.querySelector<HTMLElement>(`.${styles.heading}`);
        const featureCards = gsap.utils.toArray<HTMLElement>(`.${styles.feature}`, section);

        if (heading) {
          gsap.fromTo(
            heading,
            { autoAlpha: 0, x: -36, filter: 'blur(7px)' },
            {
              autoAlpha: 1,
              x: 0,
              filter: 'blur(0px)',
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 72%',
                once: true,
              },
            }
          );
        }

        featureCards.forEach((featureCard) => {
          const copy = featureCard.querySelector<HTMLElement>(`.${styles.copy}`);
          const frames = gsap.utils.toArray<HTMLElement>(`.${styles.imageFrame}`, featureCard);
          const images = gsap.utils.toArray<HTMLElement>(`.${styles.image}`, featureCard);

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: featureCard,
              start: 'top 82%',
              end: 'top 28%',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          if (copy) {
            timeline.fromTo(
              copy,
              { autoAlpha: 0.15, y: 34, filter: 'blur(7px)' },
              { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'none' }
            );
          }

          timeline.fromTo(
            frames,
            {
              autoAlpha: 0,
              x: (index) => (index % 2 === 0 ? 42 : -42),
              y: 40,
              rotation: (index) => (index % 2 === 0 ? 1.5 : -1.5),
              scale: 0.95,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              duration: 1,
              ease: 'none',
              stagger: 0.22,
            },
            '-=0.2'
          );

          gsap.fromTo(
            images,
            { yPercent: -3 },
            {
              yPercent: 3,
              ease: 'none',
              scrollTrigger: {
                trigger: featureCard,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        });
      }, section);
    };

    void setupAnimation();

    return () => {
      cancelled = true;
      animationContext?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="landing-features-title" className={styles.section}>
      <div className={styles.layout}>
        <header className={styles.headingColumn}>
          <h2 className={styles.heading} id="landing-features-title">
            Main Features
          </h2>
        </header>

        <div className={styles.featureList}>
          {FEATURES.map((feature) => (
            <article className={styles.feature} key={feature.title}>
              <div className={styles.copy}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.description}>
                  {feature.description.map((descriptionLine) => (
                    <span className={styles.descriptionLine} key={descriptionLine}>
                      {descriptionLine}
                    </span>
                  ))}
                </p>
              </div>

              <div className={styles.imageList}>
                {FEATURE_SCREEN_KEYS.map((screenKey) => (
                  <figure className={styles.imageFrame} key={screenKey}>
                    {/* TODO: 기능별 실제 화면 캡처 이미지가 준비되면 img-interview를 교체합니다. */}
                    <Image
                      fill
                      alt=""
                      className={styles.image}
                      sizes="(max-width: 768px) calc(100vw - 40px), 760px"
                      src={InterviewImage}
                    />
                  </figure>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
