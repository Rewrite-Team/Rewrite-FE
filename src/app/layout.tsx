import localFont from 'next/font/local';

import '@/shared/styles/globals.css';

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
      <body>{children}</body>
    </html>
  );
}
