import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';

import { Input } from './index';

import type { InputType } from './Input.types';
import type { Meta, StoryObj } from '@storybook/nextjs';

interface InputPlaygroundProps {
  className: string;
  defaultValue: string;
  disabled: boolean;
  errorMessage: string;
  id: string;
  invalid: boolean;
  label: string;
  placeholder: string;
  required: boolean;
  type: InputType;
}

interface ExampleFormValues {
  jobUrl: string;
  title: string;
}

function InputPlayground({
  className,
  defaultValue,
  disabled,
  errorMessage,
  id,
  invalid,
  label,
  placeholder,
  required,
  type,
}: InputPlaygroundProps) {
  return (
    <Input className={className} disabled={disabled} id={id} invalid={invalid} required={required}>
      <Input.Label>{label}</Input.Label>
      <Input.Field
        defaultValue={defaultValue || undefined}
        key={`${type}-${defaultValue}`}
        placeholder={placeholder}
        type={type}
      />
      <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
    </Input>
  );
}

function ReactHookFormExample() {
  const [submittedValues, setSubmittedValues] = useState<ExampleFormValues | null>(null);
  const { control, handleSubmit } = useForm<ExampleFormValues>({
    defaultValues: {
      jobUrl: '',
      title: '',
    },
    mode: 'onBlur',
  });

  return (
    <form
      className="flex w-full flex-col gap-8"
      noValidate
      onSubmit={handleSubmit(setSubmittedValues)}
    >
      <FormField
        control={control}
        name="title"
        render={({ errorMessage, field, invalid }) => (
          <Input invalid={invalid} required>
            <Input.Label>자기소개서 제목</Input.Label>
            <Input.Field placeholder="카카오 자기소개서" {...field} />
            <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
          </Input>
        )}
        rules={{
          minLength: {
            message: '제목은 2자 이상 입력해 주세요.',
            value: 2,
          },
          required: '제목을 입력해 주세요.',
        }}
      />

      <FormField
        control={control}
        name="jobUrl"
        render={({ errorMessage, field, invalid }) => (
          <Input invalid={invalid}>
            <Input.Label>채용 공고 링크</Input.Label>
            <Input.Field placeholder="https://example.com/jobs/1" type="url" {...field} />
            <Input.ErrorMessage>{errorMessage}</Input.ErrorMessage>
          </Input>
        )}
        rules={{
          pattern: {
            message: '올바른 URL을 입력해 주세요.',
            value: /^https?:\/\/.+/i,
          },
        }}
      />

      <Button className="self-end" type="submit">
        저장하기
      </Button>

      {submittedValues ? (
        <pre className="m-0 rounded-lg bg-gray-700 p-4 body-14 text-gray-50">
          {JSON.stringify(submittedValues, null, 2)}
        </pre>
      ) : null}
    </form>
  );
}

const meta = {
  title: 'Shared/Input',
  component: InputPlayground,
  args: {
    className: '',
    defaultValue: '',
    disabled: false,
    errorMessage: '입력값을 확인해 주세요.',
    id: 'input-playground',
    invalid: false,
    label: '자기소개서 제목',
    placeholder: '카카오 자기소개서',
    required: false,
    type: 'text',
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Input Root의 기본 스타일을 확장하는 클래스 이름',
    },
    defaultValue: {
      control: 'text',
      description: 'Field의 초기 입력값',
    },
    disabled: {
      control: 'boolean',
      description: 'Field 입력과 포커스 차단 여부',
    },
    errorMessage: {
      control: 'text',
      description: 'invalid 상태에서 표시할 오류 문구',
    },
    id: {
      control: 'text',
      description: 'Label과 접근성 문구 연결에 사용하는 Field id',
    },
    invalid: {
      control: 'boolean',
      description: '유효성 검증 오류 상태',
    },
    label: {
      control: 'text',
      description: 'Field의 목적을 설명하는 Label',
    },
    placeholder: {
      control: 'text',
      description: 'Field 내부에 표시되는 짧은 입력 예시',
    },
    required: {
      control: 'boolean',
      description: '필수 입력 여부',
    },
    type: {
      control: 'inline-radio',
      description: 'Field의 HTML input 타입',
      options: ['text', 'number', 'url'],
    },
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
          'Label, Field, ErrorMessage를 조합하는 Compound Input입니다. 버튼은 Input.Control 안에서 함께 구성하며, 폼 상태는 FormField를 통해 React Hook Form과 연결합니다.',
      },
    },
  },
} satisfies Meta<typeof InputPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Text: Story = {
  args: {
    label: '회사명',
    placeholder: '지원할 회사명',
    type: 'text',
  },
};

export const Number: Story = {
  args: {
    label: '제한 글자 수',
    placeholder: '1000',
    type: 'number',
  },
};

export const Url: Story = {
  args: {
    label: '채용 공고 링크',
    placeholder: 'https://example.com/jobs/1',
    type: 'url',
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: '카카오 자기소개서',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    errorMessage: '제목을 입력해 주세요.',
    invalid: true,
    placeholder: '',
    required: true,
  },
};

export const WithButton: Story = {
  render: () => (
    <Input>
      <Input.Label>제한 글자 수</Input.Label>
      <Input.Control>
        <Input.Field min={0} placeholder="1000" type="number" />
        <Button size="sm">적용</Button>
      </Input.Control>
    </Input>
  ),
};

export const CustomClassName: Story = {
  render: () => (
    <Input className="max-w-150">
      <Input.Label className="mb-3 text-primary-500">지원 직무</Input.Label>
      <Input.Field className="h-14 rounded-md bg-gray-700" placeholder="프론트엔드 개발자" />
    </Input>
  ),
};

export const ReactHookForm: Story = {
  render: () => <ReactHookFormExample />,
};
