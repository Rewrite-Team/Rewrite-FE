'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';

import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

import type { CoverLetterValidationFieldError } from '../model/mapCoverLetterValidationErrors';

interface CoverLetterCreateDraftProviderProps {
  children: ReactNode;
  draft: CoverLetterDetailResponse;
}

interface DraftContextValue {
  draft: CoverLetterDetailResponse;
  errors: CoverLetterValidationFieldError[];
  setErrors: Dispatch<SetStateAction<CoverLetterValidationFieldError[]>>;
}

const EMPTY_VALIDATION: Pick<DraftContextValue, 'errors' | 'setErrors'> = {
  errors: [],
  setErrors: () => undefined,
};
const CoverLetterCreateDraftContext = createContext<DraftContextValue | null>(null);

export function CoverLetterCreateDraftProvider({
  children,
  draft,
}: CoverLetterCreateDraftProviderProps) {
  const [errors, setErrors] = useState<CoverLetterValidationFieldError[]>([]);
  const value = useMemo(() => ({ draft, errors, setErrors }), [draft, errors]);
  return (
    <CoverLetterCreateDraftContext.Provider value={value}>
      {children}
    </CoverLetterCreateDraftContext.Provider>
  );
}

export const useCoverLetterCreateDraft = () =>
  useContext(CoverLetterCreateDraftContext)?.draft ?? null;
export const useCoverLetterCreateValidation = () =>
  useContext(CoverLetterCreateDraftContext) ?? EMPTY_VALIDATION;
