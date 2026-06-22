import { FormControlErrorMessage } from '@/shared/ui/form-control/FormControlErrorMessage';

import type { TextAreaErrorMessageProps } from './TextArea.types';

export function TextAreaErrorMessage({ children, className, ...props }: TextAreaErrorMessageProps) {
  return (
    <FormControlErrorMessage {...props} className={className}>
      {children}
    </FormControlErrorMessage>
  );
}
