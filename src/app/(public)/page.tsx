import { LandingClosing } from '@/widgets/landing/closing';
import { LandingFeatures } from '@/widgets/landing/features';
import { LandingHero } from '@/widgets/landing/hero';
import { LandingPreparation } from '@/widgets/landing/preparation';
import { LandingProcess } from '@/widgets/landing/process';

export default function PublicHomePage() {
  return (
    <>
      <LandingHero />
      <LandingPreparation />
      <LandingProcess />
      <LandingClosing />
      <LandingFeatures />
    </>
  );
}
