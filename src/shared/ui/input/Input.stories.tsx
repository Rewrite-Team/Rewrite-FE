import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';

import { Input } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

interface ExampleFormValues {
  jobUrl: string;
  title: string;
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
  component: Input,
  args: {
    children: null,
  },
  decorators: [
    (Story) => (
      <div className="w-200 max-w-[calc(100vw-2rem)] bg-gray-800 p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Input id="input-default">
      <Input.Label>자기소개서 제목</Input.Label>
      <Input.Field placeholder="카카오 자기소개서" />
      <Input.ErrorMessage>입력값을 확인해 주세요.</Input.ErrorMessage>
    </Input>
  ),
};

export const Required: Story = {
  render: () => (
    <Input id="input-required" required>
      <Input.Label>자기소개서 제목</Input.Label>
      <Input.Field placeholder="카카오 자기소개서" />
      <Input.ErrorMessage>입력값을 확인해 주세요.</Input.ErrorMessage>
    </Input>
  ),
};

export const Text: Story = {
  render: () => (
    <Input id="input-text">
      <Input.Label>회사명</Input.Label>
      <Input.Field placeholder="지원할 회사명" type="text" />
      <Input.ErrorMessage>회사명을 입력해 주세요.</Input.ErrorMessage>
    </Input>
  ),
};

export const Number: Story = {
  render: () => (
    <Input id="input-number">
      <Input.Label>제한 글자 수</Input.Label>
      <Input.Field placeholder="1000" type="number" />
      <Input.ErrorMessage>0 이상의 글자 수를 입력해 주세요.</Input.ErrorMessage>
    </Input>
  ),
};

export const Url: Story = {
  render: () => (
    <Input id="input-url">
      <Input.Label>채용 공고 링크</Input.Label>
      <Input.Field placeholder="https://example.com/jobs/1" type="url" />
      <Input.ErrorMessage>올바른 URL을 입력해 주세요.</Input.ErrorMessage>
    </Input>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Input disabled id="input-disabled">
      <Input.Label>자기소개서 제목</Input.Label>
      <Input.Field defaultValue="카카오 자기소개서" />
      <Input.ErrorMessage>입력값을 확인해 주세요.</Input.ErrorMessage>
    </Input>
  ),
};

export const WithError: Story = {
  render: () => (
    <Input id="input-error" invalid required>
      <Input.Label>자기소개서 제목</Input.Label>
      <Input.Field placeholder="" />
      <Input.ErrorMessage>제목을 입력해 주세요.</Input.ErrorMessage>
    </Input>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Input>
      <Input.Label>제한 글자 수</Input.Label>
      <Input.FieldGroup>
        <Input.Field min={0} placeholder="1000" type="number" />
        <Button size="sm" type="button">
          적용
        </Button>
      </Input.FieldGroup>
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
