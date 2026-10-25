import '@/widgets/cover-letter-detail/writing-detail.css';

import { WritingDetailDataLayoutClient } from './_components/WritingDetailDataLayoutClient';

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

  return <WritingDetailDataLayoutClient writingId={id}>{children}</WritingDetailDataLayoutClient>;
}
