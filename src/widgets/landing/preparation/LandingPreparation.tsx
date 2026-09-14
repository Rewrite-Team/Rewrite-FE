'use client';

import { useEffect, useRef } from 'react';

import { SearchIcon } from '@/shared/assets/icons/common';

import styles from './LandingPreparation.module.css';

type DocumentVariant = 'bottom' | 'left' | 'right' | 'top';

interface DocumentCardProps {
  variant: DocumentVariant;
}

const SKELETON_LINE_KEYS = ['01', '02', '03', '04', '05', '06', '07'] as const;

const DOCUMENT_ENTRY_MOTION: Record<
  DocumentVariant,
  { rotation: number; startRotation: number; x: number; y: number }
> = {
  left: { rotation: -0.55, startRotation: -5, x: -80, y: 28 },
  top: { rotation: 0.35, startRotation: 3.5, x: 0, y: -72 },
  bottom: { rotation: -0.4, startRotation: -3.5, x: 0, y: 72 },
  right: { rotation: 0.6, startRotation: 5, x: 80, y: 28 },
};

function DocumentCard({ variant }: DocumentCardProps) {
  const hasProfileHeader = variant === 'top' || variant === 'bottom';

  return (
    <div
      aria-hidden
      className={`${styles.documentCard} ${styles[variant]}`}
      data-document-variant={variant}
    >
      {hasProfileHeader ? (
        <div className={styles.documentHeader}>
          <span className={styles.avatar} />
          <div className={styles.headerCopy}>
            <span className={styles.headerLine} />
            <span className={styles.headerSubline} />
          </div>
        </div>
      ) : null}

      <div className={styles.documentLines}>
        {SKELETON_LINE_KEYS.map((lineKey) => (
          <span key={lineKey} />
        ))}
      </div>
    </div>
  );
}

export function LandingPreparation() {
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
        const cards = gsap.utils.toArray<HTMLElement>(`.${styles.documentCard}`, section);
        const questionBar = section.querySelector<HTMLElement>(`.${styles.questionBar}`);
        const searchIconArea = section.querySelector<HTMLElement>(`.${styles.searchIconArea}`);

        if (!questionBar || !searchIconArea) {
          return;
        }

        const floatingTweens = cards.map((card, index) => {
          const variant = card.dataset.documentVariant as DocumentVariant;
          const { rotation } = DOCUMENT_ENTRY_MOTION[variant];

          return gsap.to(card, {
            x: index % 2 === 0 ? -5 : 5,
            y: index % 2 === 0 ? -18 : 16,
            rotation: rotation + (index % 2 === 0 ? 0.85 : -0.85),
            duration: 2.8 + index * 0.32,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            paused: true,
          });
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            once: true,
          },
          onComplete: () => {
            floatingTweens.forEach((tween) => tween.play());
          },
        });

        cards.forEach((card, index) => {
          const variant = card.dataset.documentVariant as DocumentVariant;
          const motion = DOCUMENT_ENTRY_MOTION[variant];

          timeline.fromTo(
            card,
            {
              autoAlpha: 0,
              x: motion.x,
              y: motion.y,
              rotation: motion.startRotation,
              scale: 0.9,
              filter: 'blur(7px)',
            },
            {
              autoAlpha: 0.86,
              x: 0,
              y: 0,
              rotation: motion.rotation,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.95,
              ease: 'power3.out',
            },
            index === 0 ? 0 : `-=${0.7 - index * 0.05}`
          );
        });

        timeline
          .fromTo(
            questionBar,
            { autoAlpha: 0, y: 20, scaleX: 0.9, filter: 'blur(5px)' },
            {
              autoAlpha: 1,
              y: 0,
              scaleX: 1,
              filter: 'blur(0px)',
              duration: 0.75,
              ease: 'back.out(1.35)',
            },
            '-=0.32'
          )
          .fromTo(
            searchIconArea,
            { rotation: -70, scale: 0.55 },
            { rotation: 0, scale: 1, duration: 0.55, ease: 'back.out(2)' },
            '-=0.5'
          );
      }, section);
    };

    void setupAnimation();

    return () => {
      cancelled = true;
      animationContext?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="landing-preparation-title"
      className={styles.section}
    >
      <div className={styles.scene}>
        <DocumentCard variant="left" />
        <DocumentCard variant="top" />
        <DocumentCard variant="bottom" />
        <DocumentCard variant="right" />

        <div className={styles.questionBar}>
          <span aria-hidden className={styles.searchIconArea}>
            <SearchIcon className={styles.searchIcon} focusable={false} />
          </span>
          <h2 className={styles.question} id="landing-preparation-title">
            자기소개서부터 면접까지, 어떻게 준비해야 할까?
          </h2>
        </div>
      </div>
    </section>
  );
}
