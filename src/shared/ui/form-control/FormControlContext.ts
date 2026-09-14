import { createContext, use } from 'react';

import type { FormControlContextValue } from './FormControl.types';

const FormControlContext = createContext<FormControlContextValue | null>(null);

/**
 * ## useFormControlContext
 *
 * @description
 * Input과 TextArea의 compound 하위 컴포넌트가 Root의 id 및 폼 상태를 읽는 내부 훅입니다.
 * Label, Field, ErrorMessage가 동일한 접근성 연결 정보와 상태를 사용하도록 합니다.
 *
 * ### 주의할 점
 *
 * 반드시 `FormControlContext`를 제공하는 Input 또는 TextArea Root 내부에서 사용해야 합니다.
 * 일반 화면 컴포넌트에서는 이 훅을 직접 사용하지 않고 `Input.*` 또는 `TextArea.*` API를
 * 통해 FormControl 기반 컴포넌트를 조합합니다.
 *
 * @example
 * ```tsx
 * function CustomField() {
 *   const { disabled, fieldId } = useFormControlContext();
 *
 *   return <input disabled={disabled} id={fieldId} />;
 * }
 * ```
 */
export function useFormControlContext() {
  const context = use(FormControlContext);

  if (!context) {
    throw new Error('Form control compound components must be used within a form control root.');
  }

  return context;
}

export { FormControlContext };
