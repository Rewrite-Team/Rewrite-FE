import type { CoverLetterStep3FormInput } from '@/features/cover-letter/create-flow';

export const EMPTY_QUESTION: CoverLetterStep3FormInput['questions'][number] = {
  answer: '',
  characterLimit: '',
  question: '',
};
