import {
  LandingClosing,
  LandingFeatures,
  LandingHero,
  LandingPreparation,
  LandingProcess,
} from '@/widgets/landing';

export default function LandingPage() {
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
