import { RedirectUnauthenticated } from '@/features/auth/redirect-unauthenticated';
import { AppShell } from '@/widgets/common/app-shell';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      <RedirectUnauthenticated>
        <div className="flex min-h-full flex-1 flex-col py-15">{children}</div>
      </RedirectUnauthenticated>
    </AppShell>
  );
}
