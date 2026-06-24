import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';

import { TextArea } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

interface ExampleFormValues {
  answer: string;
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
  component: TextArea,
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
} satisfies Meta<typeof TextArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TextArea id="textarea-default">
      <TextArea.Label>자기소개서 내용</TextArea.Label>
      <TextArea.Field
        placeholder="자기소개서 내용을 입력해 주세요."
        recommendedLength={1000}
        showCount
      />
      <TextArea.ErrorMessage>자기소개서 내용을 입력해 주세요.</TextArea.ErrorMessage>
    </TextArea>
  ),
};

export const WithoutCount: Story = {
  render: () => (
    <TextArea id="textarea-without-count">
      <TextArea.Label>자기소개서 내용</TextArea.Label>
      <TextArea.Field placeholder="자기소개서 내용을 입력해 주세요." />
      <TextArea.ErrorMessage>자기소개서 내용을 입력해 주세요.</TextArea.ErrorMessage>
    </TextArea>
  ),
};

export const RecommendedLengthExceeded: Story = {
  render: () => (
    <TextArea id="textarea-recommended-exceeded">
      <TextArea.Label>자기소개서 내용</TextArea.Label>
      <TextArea.Field
        defaultValue="권장 길이를 초과한 자기소개서 내용입니다."
        placeholder="자기소개서 내용을 입력해 주세요."
        recommendedLength={10}
        showCount
      />
      <TextArea.ErrorMessage>자기소개서 내용을 입력해 주세요.</TextArea.ErrorMessage>
    </TextArea>
  ),
};

export const MaxLengthReached: Story = {
  render: () => (
    <TextArea id="textarea-max-length">
      <TextArea.Label>자기소개서 내용</TextArea.Label>
      <TextArea.Field
        defaultValue="최대길이"
        maxLength={5}
        placeholder="자기소개서 내용을 입력해 주세요."
        showCount
      />
      <TextArea.ErrorMessage>자기소개서 내용을 입력해 주세요.</TextArea.ErrorMessage>
    </TextArea>
  ),
};

export const WithError: Story = {
  render: () => (
    <TextArea id="textarea-error" invalid required>
      <TextArea.Label>자기소개서 내용</TextArea.Label>
      <TextArea.Field
        placeholder="자기소개서 내용을 입력해 주세요."
        recommendedLength={1000}
        showCount
      />
      <TextArea.ErrorMessage>자기소개서 내용을 입력해 주세요.</TextArea.ErrorMessage>
    </TextArea>
  ),
};

export const Disabled: Story = {
  render: () => (
    <TextArea disabled id="textarea-disabled">
      <TextArea.Label>자기소개서 내용</TextArea.Label>
      <TextArea.Field
        defaultValue="수정할 수 없는 자기소개서 내용입니다."
        placeholder="자기소개서 내용을 입력해 주세요."
        recommendedLength={1000}
        showCount
      />
      <TextArea.ErrorMessage>자기소개서 내용을 입력해 주세요.</TextArea.ErrorMessage>
    </TextArea>
  ),
};

export const ReactHookForm: Story = {
  render: () => <ReactHookFormExample />,
};
