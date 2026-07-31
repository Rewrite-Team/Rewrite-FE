import Link from 'next/link';

import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/assets/icons/common';
import { cn } from '@/shared/styles/utils/cn';

import { getPaginationItems } from './getPaginationItems';

interface PaginationArrowProps {
  direction: 'previous' | 'next';
  href?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pathname: string;
  className?: string;
}

const paginationItemClassName =
  'focus-ring inline-flex size-10 items-center justify-center rounded-full body-14 font-medium text-white transition-colors hover:bg-gray-800 hover:text-primary-300';

/**
 * ## PaginationArrow
 *
 * @description
 * 페이지네이션의 이전 또는 다음 페이지 이동을 표시하는 내부 컴포넌트입니다.
 * `href`가 있으면 이동 가능한 링크를 렌더링하고, 없으면 동일한 크기의 비활성 표시를 렌더링합니다.
 *
 * @param direction - 이전 또는 다음 방향
 * @param href - 이동할 페이지 주소. 없으면 접근성 트리에서 제외된 비활성 표시를 렌더링합니다.
 */
function PaginationArrow({ direction, href }: PaginationArrowProps) {
  const isPrevious = direction === 'previous';
  const label = isPrevious ? '이전 페이지' : '다음 페이지';
  const Icon = isPrevious ? ChevronLeftIcon : ChevronRightIcon;
  const icon = <Icon aria-hidden className="size-10 shrink-0" focusable={false} />;

  if (href) {
    return (
      <Link aria-label={label} className={paginationItemClassName} href={href}>
        {icon}
      </Link>
    );
  }

  return (
    <span aria-hidden className="inline-flex size-10 items-center justify-center text-gray-500">
      {icon}
    </span>
  );
}

/**
 * ## Pagination
 *
 * @description
 * 페이지 기반 목록에서 이전, 다음 및 각 페이지로 이동하는 공통 내비게이션입니다.
 * 현재 페이지는 `aria-current`로 알리고 이동할 수 없는 화살표는 접근성 트리에서 제외합니다.
 * 전체 페이지가 8개 이상이면 현재 페이지 위치에 따라 생략 기호를 표시합니다.
 *
 * ### 주의할 점
 *
 * `currentPage`는 1 이상 `totalPages` 이하로 정규화한 값을 전달해야 합니다.
 * 페이지 이동 주소는 `pathname`에 `page` 쿼리 파라미터를 추가해 생성합니다.
 *
 * @param currentPage - 현재 선택된 페이지 번호
 * @param totalPages - 목록의 전체 페이지 수
 * @param pathname - 페이지 번호를 쿼리로 연결할 목록 경로
 * @param className - 페이지네이션 배치를 조정할 외부 스타일
 *
 * @example
 * ```tsx
 * import { Pagination } from '@/shared/ui/pagination';
 *
 * <Pagination
 *   className="mt-16 lg:mt-20"
 *   currentPage={3}
 *   pathname="/writing"
 *   totalPages={10}
 * />
 * ```
 */
export function Pagination({ className, currentPage, pathname, totalPages }: PaginationProps) {
  const items = getPaginationItems(currentPage, totalPages);
  const getHref = (page: number) => `${pathname}?page=${page}`;

  return (
    <nav
      aria-label="페이지 이동"
      className={cn('flex w-full items-center justify-center', className)}
    >
      <ul className="m-0 flex items-center justify-center gap-1 p-0">
        <li className="flex items-center justify-center">
          <PaginationArrow
            direction="previous"
            href={currentPage > 1 ? getHref(currentPage - 1) : undefined}
          />
        </li>

        {items.map((item) => {
          if (typeof item === 'string') {
            return (
              <li className="inline-flex h-10 w-6 items-center justify-center" key={item}>
                <span aria-hidden className="text-gray-100">
                  …
                </span>
                <span className="sr-only">생략된 페이지</span>
              </li>
            );
          }

          return (
            <li className="flex items-center justify-center" key={item}>
              <Link
                aria-current={item === currentPage ? 'page' : undefined}
                aria-label={`${item}페이지`}
                className={cn(
                  paginationItemClassName,
                  item === currentPage && 'bg-primary-500 text-white hover:bg-primary-600'
                )}
                href={getHref(item)}
              >
                {item}
              </Link>
            </li>
          );
        })}

        <li className="flex items-center justify-center">
          <PaginationArrow
            direction="next"
            href={currentPage < totalPages ? getHref(currentPage + 1) : undefined}
          />
        </li>
      </ul>
    </nav>
  );
}
