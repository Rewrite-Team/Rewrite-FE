'use client';

import { createContext } from 'react';

import type { CoverLetterCreateFlowContextValue } from './types/CoverLetterCreateFlow.types';

export const CoverLetterCreateFlowContext = createContext<CoverLetterCreateFlowContextValue | null>(
  null
);
