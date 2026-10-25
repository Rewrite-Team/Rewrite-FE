'use client';

import { useQuery } from '@tanstack/react-query';

import { coverLetterDetailQueryOptions } from '../api/queries';

/** 지정한 자기소개서의 서버 데이터를 조회합니다. */
export const useCoverLetterDetail = (coverLetterId: string) =>
  useQuery(coverLetterDetailQueryOptions(coverLetterId));
