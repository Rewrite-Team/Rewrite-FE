import type { ComponentPropsWithoutRef } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { COVER_LETTER_STEP_FORM_ID } from '@/widgets/cover-letter-create/constants/stepForm';

import { CoverLetterStepPanel } from './CoverLetterStepPanel';

jest.mock('@/shared/assets/icons/common', () => ({
  CheckIcon: (props: ComponentPropsWithoutRef<'svg'>) => <svg {...props} />,
}));

describe('CoverLetterStepPanel', () => {
  it('현재 단계와 완료한 단계를 접근 가능한 텍스트로 표시한다', () => {
    render(
      <CoverLetterStepPanel
        currentStep={2}
        nextAction={{ onClick: jest.fn(), status: 'enabled' }}
        onStepSelect={jest.fn()}
        saveDraftAction={{ status: 'disabled' }}
      />
    );

    expect(screen.getByText(/1단계 완료/)).toBeInTheDocument();
    expect(screen.getByText(/2단계 현재 단계/)).toBeInTheDocument();
    expect(screen.getByText(/3단계 진행 전/)).toBeInTheDocument();
  });

  it('양쪽 STEP 상태에 맞춰 연결선 색상을 표시한다', () => {
    render(
      <CoverLetterStepPanel
        currentStep={2}
        nextAction={{ onClick: jest.fn(), status: 'enabled' }}
        onStepSelect={jest.fn()}
        saveDraftAction={{ status: 'disabled' }}
      />
    );

    const connectors = screen
      .getByRole('navigation', { name: '자기소개서 등록 진행 단계' })
      .querySelectorAll('span[aria-hidden]');

    expect(connectors[0]).toHaveClass('bg-primary-500');
    expect(connectors[1]).toHaveClass('bg-gradient-to-r', 'from-primary-500', 'to-gray-500');
    expect(connectors[2]).toHaveClass('bg-gray-500');
  });

  it('다음 액션을 실행하고 API 미연결 임시 저장 액션은 비활성화한다', () => {
    const handleNext = jest.fn();

    render(
      <CoverLetterStepPanel
        currentStep={1}
        nextAction={{ onClick: handleNext, status: 'enabled' }}
        onStepSelect={jest.fn()}
        saveDraftAction={{ status: 'disabled' }}
      />
    );

    const nextButton = screen.getByRole('button', { name: '다음' });
    const saveDraftButton = screen.getByRole('button', { name: '임시 저장' });

    fireEvent.click(nextButton);

    expect(handleNext).toHaveBeenCalledTimes(1);
    expect(nextButton).toHaveAttribute('form', COVER_LETTER_STEP_FORM_ID);
    expect(nextButton).toHaveAttribute('type', 'submit');
    expect(saveDraftButton).toBeDisabled();
    expect(saveDraftButton).toHaveAttribute('form', COVER_LETTER_STEP_FORM_ID);
    expect(saveDraftButton).toHaveAttribute('type', 'submit');
  });

  it('이전 단계 아이콘만 이동할 수 있다', () => {
    const handleStepSelect = jest.fn();

    render(
      <CoverLetterStepPanel
        currentStep={3}
        nextAction={{ onClick: jest.fn(), status: 'enabled' }}
        onStepSelect={handleStepSelect}
        saveDraftAction={{ status: 'disabled' }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '직무 정보 단계로 이동' }));
    fireEvent.click(screen.getByRole('button', { name: '완료 단계로 이동' }));

    expect(handleStepSelect).toHaveBeenCalledWith(1);
    expect(handleStepSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '자기소개서 작성 단계로 이동' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '완료 단계로 이동' })).toBeDisabled();
  });

  it('마지막 단계에서는 완료 액션만 표시한다', () => {
    render(
      <CoverLetterStepPanel
        completeAction={{ status: 'disabled' }}
        currentStep={4}
        onStepSelect={jest.fn()}
      />
    );

    const completeButton = screen.getByRole('button', { name: '완료' });

    expect(completeButton).toBeDisabled();
    expect(completeButton).toHaveAttribute('form', COVER_LETTER_STEP_FORM_ID);
    expect(completeButton).toHaveAttribute('type', 'submit');
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '임시 저장' })).not.toBeInTheDocument();
  });
});
