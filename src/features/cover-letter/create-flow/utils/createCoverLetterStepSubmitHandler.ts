import type { SubmitEvent } from 'react';

interface StepSubmitOptions {
  saveDraft: () => void | Promise<unknown>;
  submitNext: (event: SubmitEvent<HTMLFormElement>) => void | Promise<unknown>;
}

/** 임시 저장은 현재 값으로 실행하고, 다음 단계는 폼 검증 핸들러에 위임합니다. */
export function createCoverLetterStepSubmitHandler({ saveDraft, submitNext }: StepSubmitOptions) {
  return (event: SubmitEvent<HTMLFormElement>) => {
    const submitter = event.nativeEvent.submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === 'save-draft') {
      event.preventDefault();
      void saveDraft();
      return;
    }
    void submitNext(event);
  };
}
