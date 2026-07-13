import type { ComponentType, SVGProps } from 'react';

import { cva } from 'class-variance-authority';

import { Button, LinkButton } from '@/shared/ui/button';

interface SidebarItemBaseProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  label: string;
  isExpanded?: boolean;
  showTooltip?: boolean;
  surface?: 'dropdown' | 'sidebar';
}

interface SidebarItemLinkProps extends SidebarItemBaseProps {
  ariaControls?: never;
  ariaExpanded?: never;
  href: string;
  onClick?: never;
  onSelect?: () => void;
}

interface SidebarItemActionProps extends SidebarItemBaseProps {
  ariaControls?: string;
  ariaExpanded?: boolean;
  href?: never;
  onClick: () => void;
  onSelect?: never;
}

type SidebarItemProps = SidebarItemActionProps | SidebarItemLinkProps;

const sidebarItemVariants = cva(
  [
    'group/item relative flex h-10 items-center rounded-lg text-gray-300 transition-[color,background-color,box-shadow] duration-200 hover:text-white',
    'focus-ring',
  ],
  {
    variants: {
      surface: {
        dropdown: 'hover:bg-gray-600',
        sidebar: 'hover:bg-gray-700',
      },
      isActive: {
        false: null,
        true: 'bg-primary-500/15 text-primary-300 ring-1 ring-primary-200/15 ring-inset shadow-sidebar-active hover:bg-primary-500/25 hover:text-primary-100',
      },
      isExpanded: {
        false: 'w-10 justify-center',
        true: 'w-full justify-start gap-3 px-3',
      },
    },
    defaultVariants: {
      isActive: false,
      isExpanded: false,
      surface: 'sidebar',
    },
  }
);

/**
 * ## SidebarItem
 *
 * @description
 * Sidebar에서 페이지 이동 링크와 화면 내 액션 버튼을 동일한 시각 규칙으로 렌더링합니다.
 * `href`가 있으면 LinkButton, 없으면 Button을 사용합니다. 접힌 상태에서는 아이콘만 표시하고
 * pointer hover 시 메뉴 설명 툴팁을 제공합니다.
 *
 * ### 접근성
 *
 * 모든 아이콘 메뉴는 `label`을 접근성 이름으로 사용합니다. 현재 페이지 링크에는
 * `aria-current="page"`를, 드롭다운 트리거에는 `aria-expanded`를 전달합니다.
 *
 * @param icon - 메뉴 의미를 나타내는 SVG 아이콘 컴포넌트
 * @param label - 메뉴 텍스트이자 아이콘 버튼의 접근성 이름
 * @param href - 전달하면 페이지 이동 링크로 렌더링되는 내부 경로
 * @param isActive - 현재 페이지 또는 선택 상태의 시각적 강조 여부
 * @param isExpanded - 아이콘 옆에 메뉴 라벨을 표시할지 여부
 * @param ariaExpanded - 드롭다운 트리거의 열림 상태
 * @param ariaControls - 드롭다운 트리거와 연결할 메뉴 요소의 id
 * @param onClick - 액션 버튼 선택 시 실행할 콜백
 * @param onSelect - 링크 선택 직전에 실행할 콜백
 * @param showTooltip - 접힌 상태에서 hover 툴팁을 표시할지 여부
 * @param surface - 메뉴가 배치되는 배경에 따른 hover 색상
 */
export function SidebarItem({
  ariaControls,
  ariaExpanded,
  href,
  icon: Icon,
  isActive = false,
  isExpanded = false,
  label,
  onClick,
  onSelect,
  showTooltip = true,
  surface = 'sidebar',
}: SidebarItemProps) {
  const content = (
    <>
      <Icon aria-hidden className="size-6 shrink-0" />
      {isExpanded ? <span className="body-14 whitespace-nowrap font-medium">{label}</span> : null}
    </>
  );

  const item = href ? (
    <LinkButton
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      className={sidebarItemVariants({ isActive, isExpanded, surface })}
      href={href}
      onClick={onSelect}
      size="icon"
      variant="ghost"
    >
      {content}
    </LinkButton>
  ) : (
    <Button
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-label={label}
      className={sidebarItemVariants({ isActive, isExpanded, surface })}
      onClick={onClick}
      size="icon"
      variant="ghost"
    >
      {content}
    </Button>
  );

  if (isExpanded || !showTooltip) {
    return item;
  }

  return (
    <span className="group/tooltip relative block">
      {item}
      <span className="body-12 pointer-events-none invisible absolute top-1/2 left-[calc(100%+8px)] z-(--z-index-tooltip) -translate-y-1/2 whitespace-nowrap rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 font-medium text-gray-50 opacity-0 shadow-(--shadow-tooltip) transition-opacity group-hover/tooltip:visible group-hover/tooltip:opacity-100">
        <span
          aria-hidden
          className="absolute top-1/2 -left-1.25 size-2.5 -translate-y-1/2 rotate-45 border-b border-l border-gray-700 bg-gray-900"
        />
        {label}
      </span>
    </span>
  );
}
