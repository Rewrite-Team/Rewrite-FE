import { Sidebar } from '@/widgets/common/sidebar';

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
      <Sidebar className="sticky top-39.5 self-start" writingId={id} />
      <section aria-label="자기소개서 콘텐츠" className="min-w-0 flex-1">
        {children}
      </section>
    </div>
  );
}
