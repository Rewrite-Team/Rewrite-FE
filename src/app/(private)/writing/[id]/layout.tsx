import { Sidebar } from '@/widgets/common/sidebar';

import '@/shared/styles/layouts/writing-detail.css';

/**
 * ## WritingDetailLayout
 *
 * @description
 * 자기소개서 상세와 하위 분석 기능에서 공통으로 사용하는 Sidebar 및 콘텐츠 영역을 구성합니다.
 * 동적 경로의 자기소개서 ID를 Sidebar에 전달하여 각 기능의 이동 경로를 생성합니다.
 */
export default async function WritingDetailLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-275 flex-1">
      <Sidebar
        className="fixed right-5 bottom-5 lg:sticky lg:top-39.5 lg:right-auto lg:bottom-auto lg:self-start"
        writingId={id}
      />
      <section aria-label="자기소개서 콘텐츠" className="min-w-0 flex-1">
        {children}
      </section>
    </div>
  );
}
