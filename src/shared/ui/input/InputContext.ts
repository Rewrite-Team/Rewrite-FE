import { createContext, use } from 'react';

import type { InputContextValue } from './Input.types';

const InputContext = createContext<InputContextValue | null>(null);

export function useInputContext() {
  const context = use(InputContext);

  if (!context) {
    throw new Error('Input compound components must be used within <Input>.');
  }

  return context;
}

export { InputContext };
