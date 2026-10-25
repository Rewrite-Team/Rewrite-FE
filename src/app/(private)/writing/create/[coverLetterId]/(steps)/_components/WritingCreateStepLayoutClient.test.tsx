import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ApiError } from '@/shared/api';
import { appToast } from '@/shared/lib/toast';

import { WritingCreateStepLayoutClient } from './WritingCreateStepLayoutClient';

const mockReplace = jest.fn();
const mockRefetch = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useParams: () => ({ coverLetterId: 'letter-id' }),
  useSelectedLayoutSegment: () => 'step1',
}));
jest.mock('@/entities/cover-letter', () => ({
  useCoverLetterDetail: () => ({
    data: undefined,
    isPending: false,
    isFetching: false,
    isRefetchError: false,
    refetch: mockRefetch,
  }),
}));
jest.mock('@/widgets/cover-letter-create', () => ({
  COVER_LETTER_STEP_CONFIG: { step1: { step: 1 } },
}));
jest.mock('@/shared/lib/toast', () => ({ appToast: { error: jest.fn() } }));
jest.mock('@/shared/ui/lottie-animation', () => ({ LottieAnimation: () => null }));

describe('WritingCreateStepLayoutClient 재시도', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('수동 재조회 실패는 토스트로 안내하고 오류 화면을 유지한다', async () => {
    mockRefetch.mockResolvedValue({ isError: true, error: new ApiError(403) });
    render(<WritingCreateStepLayoutClient>폼 내용</WritingCreateStepLayoutClient>);
    expect(appToast.error).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() =>
      expect(appToast.error).toHaveBeenCalledWith(
        '자기소개서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
      )
    );
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('자기소개서를 불러오지 못했어요');
  });

  it('재조회에서 삭제된 자기소개서를 확인하면 토스트 안내 후 목록으로 이동한다', async () => {
    mockRefetch.mockResolvedValue({ isError: true, error: new ApiError(404) });
    render(<WritingCreateStepLayoutClient>폼 내용</WritingCreateStepLayoutClient>);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/writing'));
    expect(appToast.error).toHaveBeenCalledWith('자기소개서가 없거나 접근할 수 없습니다.');
  });
});
