'use client';

import { useIsMutating } from '@tanstack/react-query';

import { getCoverLetterCreateMutationKey } from '../model/createMutationKeys';

/**
 * ## useIsCoverLetterCreatePending
 *
 * @description
 * 같은 자기소개서의 단계별 저장 또는 최종 제출이 진행 중인지 구독합니다.
 * 폼 바깥의 단계 패널에서도 저장·다음·제출 버튼을 잠그는 데 사용합니다.
 * 저장과 제출 mutation이 동일한 키를 사용해야 전체 작성 흐름의 잠금이 유지됩니다.
 *
 * @example
 * ```tsx
 * const isPending = useIsCoverLetterCreatePending(coverLetterId);
 * <Button disabled={isPending}>임시 저장</Button>
 * ```
 */
export const useIsCoverLetterCreatePending = (coverLetterId: string) =>
  useIsMutating({ mutationKey: getCoverLetterCreateMutationKey(coverLetterId) }) > 0;
