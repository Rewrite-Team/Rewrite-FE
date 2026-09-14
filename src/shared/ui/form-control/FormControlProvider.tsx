import { useCallback, useState } from 'react';

import { FormControlContext } from './FormControlContext';

import type { FormControlContextValue, FormControlProviderProps } from './FormControl.types';

/**
 * ## FormControlProvider
 *
 * @description
 * Input과 TextArea Root의 공통 상태를 제공하고 실제 렌더링된 ErrorMessage의 수를 관리합니다.
 * Field는 등록된 오류 메시지가 있을 때만 해당 id를 ARIA 속성으로 참조합니다.
 *
 * @param children - FormControl Context를 사용하는 compound 하위 컴포넌트
 * @param value - Root가 제공하는 id, required, disabled, invalid 상태
 */
export function FormControlProvider({ children, value }: FormControlProviderProps) {
  const [errorMessageCount, setErrorMessageCount] = useState(0);

  const registerErrorMessage = useCallback(() => {
    setErrorMessageCount((currentCount) => currentCount + 1);

    return () => {
      setErrorMessageCount((currentCount) => Math.max(0, currentCount - 1));
    };
  }, []);

  const contextValue: FormControlContextValue = {
    ...value,
    hasErrorMessage: errorMessageCount > 0,
    registerErrorMessage,
  };

  return <FormControlContext value={contextValue}>{children}</FormControlContext>;
}
