import { useState } from 'react';

import { CancelIcon } from '@/shared/assets/icons/common';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';

import { Surface } from './index';

import type { SurfaceProps } from './index';
import type { Meta, StoryObj } from '@storybook/nextjs';

type SurfacePlaygroundProps = Pick<
  SurfaceProps,
  'canClose' | 'closeOnEscape' | 'closeOnOutsideClick' | 'focusTrap' | 'restoreFocus' | 'scrollLock'
>;

function ModalVariantExample(props: SurfacePlaygroundProps) {
  return (
    <Surface {...props}>
      <Surface.Trigger asChild>
        <Button className="w-40">중앙 모달 열기</Button>
      </Surface.Trigger>
      <Surface.Portal>
        <Surface.Overlay />
        <Surface.Content aria-label="최종 제출 확인">
          <Surface.Header>
            <h2 className="m-0 body-20 font-semibold text-white">최종 제출하시겠습니까?</h2>
            <Surface.Close aria-label="중앙 모달 닫기" asChild>
              <Button aria-label="중앙 모달 닫기" iconOnly variant="ghost">
                <CancelIcon aria-hidden="true" />
              </Button>
            </Surface.Close>
          </Surface.Header>
          <Surface.Body>
            <p className="m-0 text-gray-100">제출 후에는 수정할 수 없습니다.</p>
          </Surface.Body>
          <Surface.Footer>
            <Button className="w-24" size="sm">
              제출
            </Button>
          </Surface.Footer>
        </Surface.Content>
      </Surface.Portal>
    </Surface>
  );
}

function PanelVariantExample(props: SurfacePlaygroundProps) {
  return (
    <Surface {...props} variant="panel">
      <Surface.Trigger asChild>
        <Button className="w-32" variant="secondary">
          패널 열기
        </Button>
      </Surface.Trigger>
      <Surface.Portal>
        <Surface.Content aria-label="필터">
          <Surface.Header>
            <h2 className="m-0 body-20 font-semibold text-white">필터</h2>
            <Surface.Close aria-label="패널 닫기" asChild>
              <Button aria-label="패널 닫기" iconOnly variant="ghost">
                <CancelIcon aria-hidden="true" />
              </Button>
            </Surface.Close>
          </Surface.Header>
          <Surface.Body className="flex flex-col gap-6">
            <Input id="surface-company">
              <Input.Label>회사명</Input.Label>
              <Input.Field placeholder="회사명을 입력해 주세요." />
              <Input.ErrorMessage />
            </Input>
            <Input id="surface-position">
              <Input.Label>직무</Input.Label>
              <Input.Field placeholder="직무를 입력해 주세요." />
              <Input.ErrorMessage />
            </Input>
          </Surface.Body>
          <Surface.Footer>
            <Button className="w-24" size="sm">
              적용
            </Button>
          </Surface.Footer>
        </Surface.Content>
      </Surface.Portal>
    </Surface>
  );
}

function PreventCloseWhenDirtyExample({ closeOnOutsideClick, ...props }: SurfacePlaygroundProps) {
  const [value, setValue] = useState('작성 중인 자기소개서 초안입니다.');
  const [message, setMessage] = useState('');
  const isDirty = value.trim().length > 0;

  return (
    <Surface
      {...props}
      closeOnOutsideClick={!isDirty && closeOnOutsideClick}
      onClosePrevented={({ reason }) => {
        setMessage(
          reason === 'outside-click'
            ? '작성 중인 내용이 있어 닫을 수 없습니다.'
            : '작성 중인 내용을 확인해 주세요.'
        );
      }}
      onOpenChange={(open) => {
        if (!open) {
          setMessage('');
        }
      }}
    >
      <Surface.Trigger asChild>
        <Button className="w-48">작성 모달 열기</Button>
      </Surface.Trigger>
      <Surface.Portal>
        <Surface.Overlay />
        <Surface.Content aria-label="자기소개서 작성">
          <Surface.Header>
            <h2 className="m-0 body-20 font-semibold text-white">자기소개서 작성</h2>
            <Surface.Close aria-label="작성 모달 닫기" asChild>
              <Button aria-label="작성 모달 닫기" iconOnly variant="ghost">
                <CancelIcon aria-hidden="true" />
              </Button>
            </Surface.Close>
          </Surface.Header>
          <Surface.Body className="flex flex-col gap-4">
            <TextArea id="surface-dirty-form">
              <TextArea.Label>자기소개서 내용</TextArea.Label>
              <TextArea.Field
                onChange={(event) => {
                  const nextValue = event.target.value;

                  setValue(nextValue);

                  if (nextValue.trim().length === 0) {
                    setMessage('');
                  }
                }}
                placeholder="자기소개서 내용을 입력해 주세요."
                value={value}
              />
              <TextArea.ErrorMessage />
            </TextArea>
            {message ? <p className="m-0 body-14 text-yellow-500">{message}</p> : null}
          </Surface.Body>
        </Surface.Content>
      </Surface.Portal>
    </Surface>
  );
}

const meta = {
  title: 'Shared/Surface',
  component: Surface,
  args: {
    canClose: true,
    children: null,
    closeOnEscape: true,
    closeOnOutsideClick: true,
    focusTrap: true,
    restoreFocus: true,
  },
  argTypes: {
    canClose: {
      control: 'boolean',
    },
    closeOnEscape: {
      control: 'boolean',
    },
    closeOnOutsideClick: {
      control: 'boolean',
    },
    children: {
      control: false,
      table: {
        disable: true,
      },
    },
    focusTrap: {
      control: 'boolean',
    },
    restoreFocus: {
      control: 'boolean',
    },
    scrollLock: {
      control: 'boolean',
    },
  },
  parameters: {
    backgrounds: {
      default: 'black',
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;

type Story = StoryObj<SurfacePlaygroundProps>;

export const ModalVariant: Story = {
  render: (args) => <ModalVariantExample {...args} />,
};

export const PanelVariant: Story = {
  render: (args) => <PanelVariantExample {...args} />,
};

export const PreventCloseWhenDirty: Story = {
  render: (args) => <PreventCloseWhenDirtyExample {...args} />,
};
