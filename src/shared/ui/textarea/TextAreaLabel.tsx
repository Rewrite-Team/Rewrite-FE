import { FormControlLabel } from '@/shared/ui/form-control/FormControlLabel';

import type { TextAreaLabelProps } from './TextArea.types';

export function TextAreaLabel({ children, className, ...props }: TextAreaLabelProps) {
  return (
    <FormControlLabel {...props} className={className}>
      {children}
    </FormControlLabel>
  );
}
