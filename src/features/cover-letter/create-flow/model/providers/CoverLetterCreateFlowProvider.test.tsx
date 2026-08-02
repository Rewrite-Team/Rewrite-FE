import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { WritingCreateStep } from '@/shared/constants/routes';

import { CoverLetterCreateFlowProvider, useCoverLetterCreateFlow } from '../..';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const CREATE_PROGRESS_STORAGE_KEY = 'cover-letter-create:highest-completed-step';

interface FlowActionsProps {
  targetStep?: WritingCreateStep;
}

function FlowActions({ targetStep = 1 }: FlowActionsProps) {
  const { navigateNext, navigateToStep } = useCoverLetterCreateFlow();

  return (
    <>
      <button onClick={() => void navigateNext()} type="button">
        다음
      </button>
      <button onClick={() => void navigateToStep(targetStep)} type="button">
        단계 이동
      </button>
    </>
  );
}

describe('CoverLetterCreateFlowProvider', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('완료하지 않은 STEP으로 직접 접근하면 첫 미완료 STEP으로 이동시킨다', async () => {
    sessionStorage.setItem(CREATE_PROGRESS_STORAGE_KEY, '1');

    render(
      <CoverLetterCreateFlowProvider currentStep={3}>
        <FlowActions />
      </CoverLetterCreateFlowProvider>
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/writing/create/step2'));
  });

  it('다음 이동에 성공하면 현재 STEP을 완료 처리한 뒤 이동한다', async () => {
    render(
      <CoverLetterCreateFlowProvider currentStep={1}>
        <FlowActions />
      </CoverLetterCreateFlowProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/writing/create/step2'));
    expect(sessionStorage.getItem(CREATE_PROGRESS_STORAGE_KEY)).toBe('1');
  });

  it('완료한 이전 STEP으로 이동한다', async () => {
    sessionStorage.setItem(CREATE_PROGRESS_STORAGE_KEY, '2');

    render(
      <CoverLetterCreateFlowProvider currentStep={3}>
        <FlowActions targetStep={1} />
      </CoverLetterCreateFlowProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '단계 이동' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/writing/create/step1'));
  });

  it('아직 완료하지 않은 다음 STEP으로 직접 이동하지 않는다', () => {
    render(
      <CoverLetterCreateFlowProvider currentStep={1}>
        <FlowActions targetStep={2} />
      </CoverLetterCreateFlowProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '단계 이동' }));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
