import { AppShell } from '@/widgets/common/app-shell';
import { Header } from '@/widgets/common/header';

export default function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell header={<Header />}>{children}</AppShell>;
}
