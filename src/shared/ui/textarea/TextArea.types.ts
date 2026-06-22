import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactNode } from 'react';

interface TextAreaProps extends Omit<ComponentPropsWithoutRef<'div'>, 'id'> {
  children: ReactNode;
  containerId?: string;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  required?: boolean;
}

interface TextAreaFieldBaseProps extends Omit<
  ComponentPropsWithRef<'textarea'>,
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'aria-invalid'
  | 'disabled'
  | 'id'
  | 'maxLength'
  | 'required'
> {
  showCount?: boolean;
}

type TextAreaFieldProps = TextAreaFieldBaseProps &
  (
    | { maxLength: number; recommendedLength?: never }
    | { maxLength?: never; recommendedLength: number }
    | { maxLength?: undefined; recommendedLength?: undefined }
  );

type TextAreaLabelProps = Omit<ComponentPropsWithoutRef<'label'>, 'htmlFor'> & {
  children: ReactNode;
};

type TextAreaErrorMessageProps = Omit<ComponentPropsWithoutRef<'p'>, 'id'> & {
  children?: ReactNode;
};

export type { TextAreaErrorMessageProps, TextAreaFieldProps, TextAreaLabelProps, TextAreaProps };
