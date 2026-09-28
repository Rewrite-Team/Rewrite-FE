import { AppShell } from '@/widgets/common/app-shell';

export default function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
