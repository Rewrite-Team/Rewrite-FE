import { AiEditIcon, KeywordIcon, WritingDetailIcon } from '@/shared/assets/icons/side-menu';
import { cn } from '@/shared/styles/utils/cn';

import { useSidebarDropdown } from './hooks/useSidebarDropdown';
import { SidebarItem } from './SidebarItem';

interface SidebarDropdownProps {
  className?: string;
  detailHref: string;
  isDetailActive: boolean;
  isExpanded: boolean;
  isKeywordActive: boolean;
  isOpen: boolean;
  keywordAnalysisHref: string;
  onClose: () => void;
  onToggle: () => void;
  showMobileLabel?: boolean;
}

/**
 * ## SidebarDropdown
 *
 * @description
 * 자기소개서 분석 트리거와 AI 첨삭·키워드 분석 이동 메뉴를 조합한 Sidebar 드롭다운입니다.
 * 열림 상태는 Sidebar가 제어하며, 현재 경로에 해당하는 하위 메뉴를 Active 상태로 표시합니다.
 *
 * ### 접근성
 *
 * 트리거에는 `aria-expanded`를 전달하여 드롭다운의 열림 상태를 보조 기술에 제공합니다.
 * 하위 이동 메뉴는 현재 경로에 해당할 때 `aria-current="page"`를 노출합니다.
 * 방향키로 드롭다운을 열고 항목 사이를 이동할 수 있으며, Home/End는 처음과 마지막 항목으로
 * 이동합니다. Escape로 닫으면 포커스를 트리거로 복원합니다.
 *
 * @param className - Sidebar 상태에 따라 최상위 메뉴 항목의 표시 방식을 조정할 클래스
 * @param detailHref - AI 첨삭 메뉴가 이동할 자기소개서 상세 경로
 * @param keywordAnalysisHref - 키워드 분석 메뉴가 이동할 경로
 * @param isDetailActive - AI 첨삭 경로의 Active 여부
 * @param isKeywordActive - 키워드 분석 경로의 Active 여부
 * @param isExpanded - 데스크톱 Sidebar의 라벨 확장 여부
 * @param isOpen - 드롭다운 표시 여부
 * @param onClose - 외부 클릭, Escape, 메뉴 선택 시 닫힘을 요청하는 콜백
 * @param onToggle - 트리거 선택 시 열림 상태 변경을 요청하는 콜백
 * @param showMobileLabel - 모바일에서 Trigger 아이콘 왼쪽에 텍스트 라벨을 표시할지 여부
 */
export function SidebarDropdown({
  className,
  detailHref,
  isDetailActive,
  isExpanded,
  isKeywordActive,
  isOpen,
  keywordAnalysisHref,
  onClose,
  onToggle,
  showMobileLabel = false,
}: SidebarDropdownProps) {
  const { dropdownId, dropdownRef, handleBlur, handleKeyDown } = useSidebarDropdown({
    isOpen,
    onClose,
    onToggle,
  });

  return (
    <li
      className={cn('relative', className)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={dropdownRef}
    >
      <SidebarItem
        ariaControls={dropdownId}
        ariaExpanded={isOpen}
        icon={WritingDetailIcon}
        isActive={isDetailActive || isKeywordActive}
        isExpanded={isExpanded}
        label="자기소개서 분석"
        onClick={onToggle}
        showMobileLabel={showMobileLabel}
        showTooltip={!isOpen}
      />

      {isOpen ? (
        <ul
          className="absolute top-0 right-[calc(100%+8px)] z-10 flex w-auto flex-col gap-1 rounded-lg bg-gray-700 p-2 shadow-lg lg:right-auto lg:left-[calc(100%+8px)] lg:w-36"
          id={dropdownId}
        >
          <li>
            <SidebarItem
              href={detailHref}
              icon={AiEditIcon}
              isActive={isDetailActive}
              isExpanded
              label="AI 첨삭"
              onSelect={onClose}
              showMobileLabel
              surface="dropdown"
            />
          </li>
          <li>
            <SidebarItem
              href={keywordAnalysisHref}
              icon={KeywordIcon}
              isActive={isKeywordActive}
              isExpanded
              label="키워드 분석"
              onSelect={onClose}
              showMobileLabel
              surface="dropdown"
            />
          </li>
        </ul>
      ) : null}
    </li>
  );
}
