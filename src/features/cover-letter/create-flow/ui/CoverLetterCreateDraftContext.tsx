'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { CoverLetterDetailResponse } from '@/entities/cover-letter';

interface CoverLetterCreateDraftProviderProps {
  children: ReactNode;
  draft: CoverLetterDetailResponse;
}

const CoverLetterCreateDraftContext = createContext<CoverLetterDetailResponse | null>(null);

export function CoverLetterCreateDraftProvider({
  children,
  draft,
}: CoverLetterCreateDraftProviderProps) {
  return (
    <CoverLetterCreateDraftContext.Provider value={draft}>
      {children}
    </CoverLetterCreateDraftContext.Provider>
  );
}

export const useCoverLetterCreateDraft = () => useContext(CoverLetterCreateDraftContext);
