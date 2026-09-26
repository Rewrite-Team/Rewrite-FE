import { fireEvent, render, screen } from '@testing-library/react';

import type { ReviewVersionSummary } from '@/entities/review-version';

import { ReviewVersionPanel } from './ReviewVersionPanel';
import { ReviewVersionProvider } from '../model/ReviewVersionContext';

jest.mock('@/shared/assets/icons/version', () => ({
  PanelCloseIcon: 'svg',
}));

const versions: ReviewVersionSummary[] = [
  {
    id: 'v1',
    label: 'V.0.1',
    createdAt: '2026-05-20T14:00:00',
    status: 'COMPLETED',
  },
  {
    id: 'v2',
    label: 'V.0.2',
    createdAt: '2026-05-21T14:00:00',
    status: 'COMPLETED',
  },
  {
    id: 'v3',
    label: 'V.0.3',
    createdAt: '2026-05-22T14:00:00',
    status: 'GENERATING',
  },
  {
    id: 'v4',
    label: 'V.0.4',
    createdAt: '2026-05-23T14:00:00',
    status: 'FAILED',
  },
];

const renderPanel = (onOpenChange = jest.fn()) =>
  render(
    <ReviewVersionProvider editableVersionId="v2" initialSelectedVersionId="v1" versions={versions}>
      <ReviewVersionPanel onOpenChange={onOpenChange} open />
    </ReviewVersionProvider>
  );

describe('ReviewVersionPanel', () => {
  it('완료, 생성 중, 실패 상태를 구분해 표시한다', () => {
    renderPanel();

    expect(screen.getByRole('dialog', { name: '버전 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /V\.0\.1/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('생성 중')).toBeInTheDocument();
    expect(screen.getByText('생성 실패')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /V\.0\.2/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /V\.0\.3/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /V\.0\.4/ })).toBeDisabled();
  });

  it('모바일에서 완료 버전을 선택하면 패널을 닫는다', () => {
    const onOpenChange = jest.fn();
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    renderPanel(onOpenChange);

    fireEvent.click(screen.getByRole('button', { name: /V\.0\.2/ }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('닫기 버튼으로 패널을 닫는다', () => {
    const onOpenChange = jest.fn();
    renderPanel(onOpenChange);

    fireEvent.click(screen.getByRole('button', { name: '버전 관리 패널 닫기' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'close-button' });
  });
});
