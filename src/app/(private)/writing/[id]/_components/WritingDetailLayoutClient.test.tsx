import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { ReviewVersionSummary } from '@/entities/review-version';
import { useReviewVersion } from '@/features/review-version/version-management';

import { WritingDetailLayoutClient } from './WritingDetailLayoutClient';

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

    fireEvent.click(screen.getByRole('button', { name: 'V.0.2 선택' }));

    expect(screen.getByText('선택 버전: 1-v002')).toBeInTheDocument();
    expect(new URL(window.location.href).searchParams.get('versionId')).toBe('1-v002');
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
});
