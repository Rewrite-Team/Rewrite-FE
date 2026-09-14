import {
  LandingClosing,
  LandingFeatures,
  LandingHero,
  LandingPreparation,
  LandingProcess,
} from '@/widgets/landing';

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
