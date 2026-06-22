import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';

import { TextArea } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

interface TextAreaPlaygroundProps {
  defaultValue: string;
  disabled: boolean;
  errorMessage: string;
  invalid: boolean;
  label: string;
  length: number;
  lengthType: 'max' | 'recommended';
  placeholder: string;
  required: boolean;
  showCount: boolean;
}

interface ExampleFormValues {
  answer: string;
}

function TextAreaPlayground({
  defaultValue,
  disabled,
  errorMessage,
  invalid,
  label,
  length,
  lengthType,
  placeholder,
  required,
  showCount,
}: TextAreaPlaygroundProps) {
  const lengthProps = lengthType === 'max' ? { maxLength: length } : { recommendedLength: length };

  return (
    <TextArea disabled={disabled} invalid={invalid} required={required}>
      <TextArea.Label>{label}</TextArea.Label>
      <TextArea.Field
        defaultValue={defaultValue || undefined}
        key={defaultValue}
        placeholder={placeholder}
        showCount={showCount}
        {...lengthProps}
      />
      <TextArea.ErrorMessage>{errorMessage}</TextArea.ErrorMessage>
    </TextArea>
  );
}

function ReactHookFormExample() {
  const [submittedValue, setSubmittedValue] = useState('');
  const { control, handleSubmit } = useForm<ExampleFormValues>({
    defaultValues: {
      answer: '',
    },
    mode: 'onBlur',
  });

  return (
    <form
      className="flex w-full flex-col gap-8"
      noValidate
      onSubmit={handleSubmit(({ answer }) => setSubmittedValue(answer))}
    >
      <FormField
        control={control}
        name="answer"
        render={({ errorMessage, field, invalid }) => (
          <TextArea invalid={invalid} required>
            <TextArea.Label>자기소개서 내용</TextArea.Label>
            <TextArea.Field
              placeholder="자기소개서 내용을 입력해 주세요."
              recommendedLength={1000}
              showCount
              {...field}
            />
            <TextArea.ErrorMessage>{errorMessage}</TextArea.ErrorMessage>
          </TextArea>
        )}
        rules={{ required: '자기소개서 내용을 입력해 주세요.' }}
      />

      <Button className="self-end" type="submit">
        저장하기
      </Button>

      {submittedValue ? (
        <p className="m-0 body-14 text-gray-50">제출된 글자 수: {submittedValue.length}자</p>
      ) : null}
    </form>
  );
}

const meta = {
  title: 'Shared/TextArea',
  component: TextAreaPlayground,
  args: {
    defaultValue: '',
    disabled: false,
    errorMessage: '자기소개서 내용을 입력해 주세요.',
    invalid: false,
    label: '자기소개서 내용',
    length: 1000,
    lengthType: 'recommended',
    placeholder: '자기소개서 내용을 입력해 주세요.',
    required: false,
    showCount: true,
  },
  argTypes: {
    defaultValue: { control: 'text' },
    disabled: { control: 'boolean' },
    errorMessage: { control: 'text' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
    length: { control: 'number' },
    lengthType: {
      control: 'inline-radio',
      options: ['recommended', 'max'],
    },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    showCount: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-200 max-w-[calc(100vw-2rem)] bg-gray-800 p-3">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '긴 텍스트 입력을 위한 Compound TextArea입니다. recommendedLength는 안내 기준이고 maxLength는 실제 입력 제한입니다.',
      },
    },
  },
} satisfies Meta<typeof TextAreaPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCount: Story = {
  args: {
    showCount: false,
  },
};

export const RecommendedLengthExceeded: Story = {
  args: {
    defaultValue: '권장 길이를 초과한 자기소개서 내용입니다.',
    length: 10,
    lengthType: 'recommended',
  },
};

export const MaxLengthReached: Story = {
  args: {
    defaultValue: '최대길이',
    length: 5,
    lengthType: 'max',
  },
};

export const WithError: Story = {
  args: {
    invalid: true,
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: '수정할 수 없는 자기소개서 내용입니다.',
    disabled: true,
  },
};

export const ReactHookForm: Story = {
  render: () => <ReactHookFormExample />,
};
