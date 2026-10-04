import { RequireAuth } from '@/features/auth/require-auth';
import { AppShell } from '@/widgets/common/app-shell';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      <RequireAuth>
        <div className="flex min-h-full flex-1 flex-col py-15">{children}</div>
      </RequireAuth>
    </AppShell>
  );
}
