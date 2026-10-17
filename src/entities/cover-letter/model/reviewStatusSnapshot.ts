import { z } from 'zod';

import { CoverLetterStatus } from '../api/types';

import type { CoverLetterListResponse } from '../api/types';

const reviewStatusSnapshotSchema = z.object({
  items: z.array(
    z.object({
      coverLetterId: z.string(),
      displayStatus: z.enum(CoverLetterStatus),
      latestReviewedVersionId: z.string().nullable(),
    })
  ),
});

/** SSE 스냅샷을 검증하고 캐시된 목록의 개수·첨삭 상태가 서버와 같은지 비교합니다. */
export const matchesCoverLetterReviewStatusSnapshot = (
  data: string,
  lists: CoverLetterListResponse[]
) => {
  try {
    const snapshot = reviewStatusSnapshotSchema.safeParse(JSON.parse(data));

    if (!snapshot.success || lists.length === 0) {
      return false;
    }

    const statuses = new Map(snapshot.data.items.map((item) => [item.coverLetterId, item]));
    return lists.every(
      (list) =>
        list.totalItems === statuses.size &&
        list.items.every((item) => {
          const status = statuses.get(item.id);
          return (
            status?.displayStatus === item.displayStatus &&
            status.latestReviewedVersionId === item.latestReviewedVersionId
          );
        })
    );
  } catch {
    return false;
  }
};
