import localFont from 'next/font/local';

import { PORTAL_ROOT_ID } from '@/shared/constants/portal';
import '@/shared/styles/globals.css';
import { ToastContainer } from '@/shared/ui/toast';
import { Footer } from '@/widgets/common/footer';
import { Header } from '@/widgets/common/header';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${pretendard.variable} ${pretendard.className}`} lang="ko">
      <body className="flex min-h-dvh flex-col bg-black">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col px-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-277.5 flex-1 flex-col">{children}</div>
        </main>
        <Footer />
        <div id={PORTAL_ROOT_ID} />
        <ToastContainer />
      </body>
    </html>
  );
}
