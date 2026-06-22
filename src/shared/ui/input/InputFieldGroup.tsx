import { cn } from '@/shared/styles/utils/cn';

import type { InputFieldGroupProps } from './Input.types';

/**
 * ## Input.FieldGroup
 *
 * @description
 * Button을 `Input.Field` 내부 오른쪽에 배치할 때 사용하는 선택적 레이아웃 컴포넌트입니다.
 * 단독 Field에는 필요하지 않으며 반드시 `Input` 내부에서 사용합니다.
 *
 * @param children - 함께 배치할 Field와 Button
 * @param className - 기본 flex 레이아웃과 간격을 확장하는 클래스 이름
 *
 * @example
 * ```tsx
 * <Input.FieldGroup>
 *   <Input.Field type="number" />
 *   <Button size="sm">적용</Button>
 * </Input.FieldGroup>
 * ```
 */
export function InputFieldGroup({ children, className, ...props }: InputFieldGroupProps) {
  return (
    <div
      {...props}
      className={cn(
        'relative w-full [&>input]:pr-24',
        '[&>button]:absolute [&>button]:top-1/2 [&>button]:right-5 [&>button]:-translate-y-1/2',
        className
      )}
    >
      {children}
    </div>
  );
}
