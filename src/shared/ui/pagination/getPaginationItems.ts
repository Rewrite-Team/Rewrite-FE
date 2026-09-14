type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

const MAX_PAGES_WITHOUT_ELLIPSIS = 7;

/**
 * 현재 페이지를 시작 또는 끝 영역으로 처리할 페이지 수입니다.
 *
 * 값이 `3`이면 전체 10페이지를 다음과 같이 구분합니다.
 *
 * - 1~3페이지: `1 2 3 4 … 10`
 * - 4~7페이지: `1 … 이전 현재 다음 … 10`
 * - 8~10페이지: `1 … 7 8 9 10`
 *
 * 시작과 끝 영역에서는 현재 페이지 옆의 이동 가능한 페이지까지 보여주기 위해
 * `VISIBLE_EDGE_PAGE_COUNT`를 이 값보다 하나 크게 계산합니다.
 */
const EDGE_CURRENT_PAGE_COUNT = 3;
const VISIBLE_EDGE_PAGE_COUNT = EDGE_CURRENT_PAGE_COUNT + 1;

/**
 * ## getPaginationItems
 *
 * @description
 * 현재 페이지와 전체 페이지 수를 기준으로 페이지네이션에 표시할 항목을 계산합니다.
 * 전체 페이지가 7개 이하이면 모든 페이지 번호를 반환하고, 그보다 많으면 현재 위치에 따라
 * 시작 또는 끝 생략 기호를 포함한 배열을 반환합니다.
 *
 * @param currentPage - 1 이상 `totalPages` 이하로 정규화된 현재 페이지 번호
 * @param totalPages - 목록의 전체 페이지 수
 * @returns 페이지 번호와 생략 기호 위치 식별자로 구성된 배열
 *
 * @example
 * ```ts
 * getPaginationItems(5, 10);
 * // [1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]
 * ```
 */
export const getPaginationItems = (currentPage: number, totalPages: number): PaginationItem[] => {
  if (totalPages <= MAX_PAGES_WITHOUT_ELLIPSIS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= EDGE_CURRENT_PAGE_COUNT) {
    const pages = Array.from({ length: VISIBLE_EDGE_PAGE_COUNT }, (_, index) => index + 1);

    return [...pages, 'end-ellipsis', totalPages];
  }

  if (currentPage >= totalPages - EDGE_CURRENT_PAGE_COUNT + 1) {
    const firstVisiblePage = totalPages - EDGE_CURRENT_PAGE_COUNT;
    const pages = Array.from(
      { length: VISIBLE_EDGE_PAGE_COUNT },
      (_, index) => firstVisiblePage + index
    );

    return [1, 'start-ellipsis', ...pages];
  }

  return [
    1,
    'start-ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'end-ellipsis',
    totalPages,
  ];
};
