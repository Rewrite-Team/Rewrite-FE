import { fireEvent, render, screen } from '@testing-library/react';

import { Sidebar } from './Sidebar';

jest.mock('@/shared/assets/icons/side-menu', () => ({
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
  it('모바일에서는 펼친 패널 내부에 아이콘과 텍스트 라벨을 표시한다', () => {
    render(<Sidebar writingId="1" />);

    const aiEditMenuItem = screen.getByRole('link', { name: 'AI 첨삭' }).closest('li');

    expect(aiEditMenuItem).toHaveClass('hidden', 'lg:block');

    fireEvent.click(screen.getByRole('button', { name: '사이드바 펼치기' }));

    expect(aiEditMenuItem).not.toHaveClass('hidden');
    expect(aiEditMenuItem).toHaveClass('w-full');
    expect(screen.getByRole('button', { name: '메뉴 접기' }).closest('li')).toHaveClass(
      'lg:order-first'
    );
    expect(screen.getByRole('button', { name: '메뉴 접기' }).closest('li')).toBe(
      screen.getByRole('list').lastElementChild
    );
    expect(screen.getByText('메뉴 접기')).toHaveClass('hidden', 'lg:inline');
    expect(screen.getByText('AI 첨삭')).toHaveClass('inline', 'text-gray-100');
    expect(screen.getByText('키워드 분석')).toHaveClass('inline', 'text-gray-100');
    expect(screen.getByText('AI 면접')).toHaveClass('inline', 'text-gray-100');
    expect(screen.getByRole('link', { name: 'AI 면접' }).querySelector('svg')).not.toHaveClass(
      'hidden'
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

  it('상세형 모바일 메뉴를 펼치면 키워드 분석 위 구분선을 표시한다', () => {
    render(<Sidebar pathname="/writing/1" variant="full" writingId="1" />);

    const keywordMenuItem = screen.getByRole('link', { name: '키워드 분석' }).closest('li');
    const featureDivider = keywordMenuItem?.previousElementSibling;

    expect(featureDivider).toHaveClass('hidden', 'lg:block');

    fireEvent.click(screen.getByRole('button', { name: '사이드바 펼치기' }));

    expect(featureDivider).toHaveClass('block', 'lg:block');
    expect(featureDivider).not.toHaveClass('hidden');
  });

  it('AI 첨삭이 아닌 화면에서는 기능 메뉴 구분선을 표시하지 않는다', () => {
    const { container } = render(<Sidebar pathname="/writing/1/keyword-analysis" writingId="1" />);

    expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(1);
  });

  it('탐색 링크를 선택하면 펼친 사이드바를 닫는다', () => {
    render(<Sidebar writingId="1" />);

    fireEvent.click(screen.getByRole('button', { name: '사이드바 펼치기' }));
    fireEvent.click(screen.getByRole('link', { name: '키워드 분석' }));

    expect(screen.getByRole('button', { name: '사이드바 펼치기' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('link', { name: '키워드 분석' }).closest('li')).toHaveClass(
      'hidden',
      'lg:block'
    );
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
