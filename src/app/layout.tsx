import localFont from 'next/font/local';

import { PORTAL_ROOT_ID } from '@/shared/constants/portal';
import '@/shared/styles/globals.css';
import { ToastContainer } from '@/shared/ui/toast';

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
      <body>
        {children}
        <div id={PORTAL_ROOT_ID} />
        <ToastContainer />
      </body>
    </html>
  );
}
