import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { ReviewVersionSummary } from '@/entities/review-version';
import { useReviewVersion } from '@/features/review-version/version-management';

import { WritingDetailLayoutClient } from './WritingDetailLayoutClient';

jest.mock('next/navigation', () => {
  const { useSyncExternalStore } = jest.requireActual<typeof import('react')>('react');
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  return {
    navigateTo: (url: string) => {
      window.history.pushState({}, '', url);
      listeners.forEach((listener) => listener());
    },
    useSearchParams: () => {
      const search = useSyncExternalStore(
        subscribe,
        () => window.location.search,
        () => ''
      );

      return new URLSearchParams(search);
    },
    usePathname: () =>
      useSyncExternalStore(
        subscribe,
        () => window.location.pathname,
        () => '/writing/1'
      ),
  };
});

jest.mock('@/shared/assets/icons/version', () => ({
  PanelCloseIcon: 'svg',
}));

jest.mock('@/widgets/common/sidebar', () => ({
  Sidebar: ({
    isVersionPanelOpen,
    onVersionClick,
  }: {
    isVersionPanelOpen: boolean;
    onVersionClick: () => void;
  }) => (
    <button aria-expanded={isVersionPanelOpen} onClick={onVersionClick}>
      버전 관리
    </button>
  ),
}));

const versions: ReviewVersionSummary[] = [
  { id: '1-v001', label: 'V.0.1', createdAt: '2026-05-20T14:00:00', status: 'COMPLETED' },
  { id: '1-v002', label: 'V.0.2', createdAt: '2026-05-21T14:00:00', status: 'COMPLETED' },
  { id: '1-v003', label: 'V.0.3', createdAt: '2026-05-22T14:00:00', status: 'GENERATING' },
];

const navigateTo = (url: string) => {
  const navigation = jest.requireMock<{
    navigateTo: (nextUrl: string) => void;
  }>('next/navigation');

  navigation.navigateTo(url);
};

function SelectedVersionProbe() {
  const { selectedVersionId, selectVersion } = useReviewVersion();

  return (
    <div>
      <span>선택 버전: {selectedVersionId}</span>
      <button onClick={() => selectVersion('1-v002')}>V.0.2 선택</button>
    </div>
  );
}

describe('WritingDetailLayoutClient', () => {
  it('URL의 완료 버전을 복원하고 선택 변경을 URL에 기록한다', async () => {
    window.history.replaceState({}, '', '/writing/1?versionId=1-v001');
    const replaceStateSpy = jest.spyOn(window.history, 'replaceState');

    const view = render(
      <WritingDetailLayoutClient
        initialSelectedVersionId="1-v002"
        versions={versions}
        writingId="1"
      >
        <SelectedVersionProbe />
      </WritingDetailLayoutClient>
    );

    expect(await screen.findByText('선택 버전: 1-v001')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'V.0.2 선택' }));
    view.rerender(
      <WritingDetailLayoutClient
        initialSelectedVersionId="1-v002"
        versions={versions}
        writingId="1"
      >
        <SelectedVersionProbe />
      </WritingDetailLayoutClient>
    );

    expect(await screen.findByText('선택 버전: 1-v002')).toBeInTheDocument();
    expect(new URL(window.location.href).searchParams.get('versionId')).toBe('1-v002');
    expect(replaceStateSpy).toHaveBeenLastCalledWith(null, '', '/writing/1?versionId=1-v002');
  });

  it('진행 중이거나 잘못된 URL 버전은 최신 완료 버전으로 정규화한다', async () => {
    window.history.replaceState({}, '', '/writing/1?versionId=1-v003');

    render(
      <WritingDetailLayoutClient
        initialSelectedVersionId="1-v002"
        versions={versions}
        writingId="1"
      >
        <SelectedVersionProbe />
      </WritingDetailLayoutClient>
    );

    await waitFor(() => {
      expect(new URL(window.location.href).searchParams.get('versionId')).toBe('1-v002');
    });
  });

  it('같은 경로에서 쿼리만 변경되어도 선택 버전을 동기화한다', async () => {
    window.history.replaceState({}, '', '/writing/1?versionId=1-v001');

    render(
      <WritingDetailLayoutClient
        initialSelectedVersionId="1-v002"
        versions={versions}
        writingId="1"
      >
        <SelectedVersionProbe />
      </WritingDetailLayoutClient>
    );

    expect(await screen.findByText('선택 버전: 1-v001')).toBeInTheDocument();

    act(() => navigateTo('/writing/1?versionId=1-v002'));

    expect(await screen.findByText('선택 버전: 1-v002')).toBeInTheDocument();
  });

  it('버전 목록이 비어 있으면 잘못된 버전 쿼리를 제거한다', async () => {
    window.history.replaceState({}, '', '/writing/1?versionId=unknown');

    render(
      <WritingDetailLayoutClient initialSelectedVersionId="" versions={[]} writingId="1">
        <SelectedVersionProbe />
      </WritingDetailLayoutClient>
    );

    await waitFor(() => {
      expect(new URL(window.location.href).searchParams.has('versionId')).toBe(false);
    });
  });

  it('상세 페이지를 벗어나면 버전 패널을 닫고 재진입해도 닫힌 상태를 유지한다', () => {
    window.history.replaceState({}, '', '/writing/1');

    render(
      <WritingDetailLayoutClient
        initialSelectedVersionId="1-v002"
        versions={versions}
        writingId="1"
      >
        <SelectedVersionProbe />
      </WritingDetailLayoutClient>
    );

    fireEvent.click(screen.getByRole('button', { name: '버전 관리' }));
    expect(screen.getByRole('dialog', { name: '버전 관리' })).toBeInTheDocument();

    act(() => navigateTo('/writing/1/keyword-analysis'));

    expect(screen.queryByRole('dialog', { name: '버전 관리' })).not.toBeInTheDocument();

    act(() => navigateTo('/writing/1'));

    expect(screen.getByRole('button', { name: '버전 관리' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('dialog', { name: '버전 관리' })).not.toBeInTheDocument();
  });
});
