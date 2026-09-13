import { fireEvent, render, screen } from '@testing-library/react';

import { Sidebar } from './Sidebar';

jest.mock('@/shared/assets/icons/side-menu', () => ({
  AiEditIcon: 'svg',
  DeleteIcon: 'svg',
  InterviewIcon: 'svg',
  KeywordIcon: 'svg',
  MenuIcon: 'svg',
  VersionIcon: 'svg',
  WritingDetailIcon: 'svg',
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/writing/1/keyword-analysis',
}));

describe('Sidebar', () => {
  it('모바일에서는 아이콘 왼쪽에 배경 없는 텍스트 라벨을 표시한다', () => {
    render(<Sidebar writingId="1" />);

    const analysisMenuItem = screen.getByRole('button', { name: '자기소개서 분석' }).closest('li');

    expect(analysisMenuItem).toHaveClass('hidden', 'lg:block');

    fireEvent.click(screen.getByRole('button', { name: '사이드바 펼치기' }));

    expect(analysisMenuItem).not.toHaveClass('hidden');
    expect(screen.getByRole('button', { name: '메뉴 접기' }).closest('li')).toHaveClass(
      'order-last',
      'lg:order-none'
    );
    expect(screen.getByText('메뉴 접기')).toHaveClass('text-gray-100', 'lg:inline');
    expect(screen.getByText('자기소개서 분석')).toHaveClass('text-gray-100', 'lg:inline');
    expect(screen.getByText('AI 면접')).toHaveClass('text-gray-100', 'lg:inline');
    expect(screen.getByRole('link', { name: 'AI 면접' }).querySelector('svg')).not.toHaveClass(
      'hidden'
    );

    fireEvent.click(screen.getByRole('button', { name: '자기소개서 분석' }));

    expect(screen.getByText('메뉴 접기')).toHaveClass('hidden', 'lg:inline');
    expect(screen.getByText('AI 면접')).toHaveClass('hidden', 'lg:inline');
    expect(screen.getByText('AI 첨삭')).toHaveClass('text-gray-100', 'lg:inline');
    expect(screen.getByText('키워드 분석')).toHaveClass(
      'right-[calc(100%+0.125rem)]',
      'text-gray-100',
      'lg:inline'
    );
  });

  it('펼친 메뉴의 backdrop을 누르면 사이드바를 닫는다', () => {
    render(<Sidebar writingId="1" />);

    fireEvent.click(screen.getByRole('button', { name: '사이드바 펼치기' }));
    fireEvent.click(screen.getByRole('button', { name: '사이드바 닫기' }));

    expect(screen.getByRole('button', { name: '사이드바 펼치기' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('button', { name: '사이드바 닫기' })).not.toBeInTheDocument();
  });

  it('펼친 메뉴에서 Escape를 누르면 사이드바를 닫고 토글 버튼으로 포커스를 복원한다', () => {
    render(<Sidebar writingId="1" />);

    fireEvent.click(screen.getByRole('button', { name: '사이드바 펼치기' }));
    screen.getByRole('link', { name: 'AI 면접' }).focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    const sidebarToggle = screen.getByRole('button', { name: '사이드바 펼치기' });

    expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
    expect(sidebarToggle).toHaveFocus();
  });
});
