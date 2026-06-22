import { cn } from '@/shared/styles/utils/cn';

import { useFormControlContext } from './FormControlContext';

import type { FormControlLabelProps } from './FormControl.types';

/**
 * ## FormControlLabel
 *
 * @description
 * Input과 TextArea가 공유하는 Label 기반 컴포넌트입니다. Root가 제공하는 `fieldId`를
 * `htmlFor`에 적용하고 `required` 상태에 따라 시각적인 필수 표시를 추가합니다.
 *
 * ### 주의할 점
 *
 * 이 컴포넌트는 FormControl의 내부 기반이므로 직접 사용하기보다 `Input.Label` 또는
 * `TextArea.Label`을 사용합니다. `htmlFor`는 Root에서 관리하므로 외부에서 전달하지 않습니다.
 *
 * ### 접근성
 *
 * 필수 표시 `*`는 장식 요소이므로 스크린 리더에서 제외합니다. 실제 필수 상태는 Root와
 * 연결된 Field의 네이티브 `required` 및 `aria-required` 속성으로 전달합니다.
 *
 * @param children - 입력 요소의 목적을 설명하는 Label 문구
 * @param className - 공통 Label 스타일을 확장하는 클래스 이름
 *
 * @example
 * ```tsx
 * <Input required>
 *   <Input.Label>회사명</Input.Label>
 *   <Input.Field />
 * </Input>
 * ```
 */
export function FormControlLabel({ children, className, ...props }: FormControlLabelProps) {
  const { fieldId, required } = useFormControlContext();

  return (
    <label
      {...props}
      className={cn('mb-6 w-fit body-18 font-semibold text-white', className)}
      htmlFor={fieldId}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-primary-500">
          {' '}
          *
        </span>
      ) : null}
    </label>
  );
}
