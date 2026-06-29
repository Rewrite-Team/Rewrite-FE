import { useState } from 'react';
import type { ComponentProps } from 'react';

import { Button } from '@/shared/ui/button';

import { ConfirmModal } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

type ConfirmModalStoryProps = ComponentProps<typeof ConfirmModal>;

function ButtonOpenConfirmModalExample(args: ConfirmModalStoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    args.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    args.onCancel?.();
  };

  return (
    <div className="flex min-h-80 items-center justify-center">
      <Button onClick={() => setIsOpen(true)}>ConfirmModal 열기</Button>
      <ConfirmModal
        {...args}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        onOpenChange={setIsOpen}
        open={isOpen}
      />
    </div>
  );
}

function ControlledConfirmModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('대기 중');

  const handleConfirm = () => {
    setMessage('확인 이벤트가 실행되었습니다.');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setMessage('취소 이벤트가 실행되었습니다.');
  };

  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-4">
      <Button onClick={() => setIsOpen(true)}>ConfirmModal 열기</Button>
      <p className="m-0 body-14 text-gray-100">{message}</p>
      <ConfirmModal
        cancelLabel="아니오"
        confirmLabel="저장하기"
        description="버전 V.0.1로 저장됩니다."
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        onOpenChange={setIsOpen}
        open={isOpen}
        title="해당 자기소개서를 저장하시겠습니까?"
      />
    </div>
  );
}

function LoadingConfirmModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-80 items-center justify-center">
      <Button onClick={() => setIsOpen(true)}>Loading ConfirmModal 열기</Button>
      <ConfirmModal
        cancelLabel="아니오"
        confirmLabel="저장하기"
        description="저장 중에는 모달을 닫을 수 없습니다."
        isLoading
        onConfirm={() => undefined}
        onOpenChange={setIsOpen}
        open={isOpen}
        title="해당 자기소개서를 저장하시겠습니까?"
      />
    </div>
  );
}

const meta = {
  title: 'Shared/ConfirmModal',
  component: ConfirmModal,
  tags: ['autodocs'],
  args: {
    cancelLabel: '아니오',
    confirmLabel: '저장하기',
    defaultOpen: false,
    description: '버전 V.0.1로 저장됩니다.',
    isLoading: false,
    onConfirm: () => undefined,
    title: '해당 자기소개서를 저장하시겠습니까?',
  },
  argTypes: {
    cancelLabel: {
      control: 'text',
    },
    closeOnEscape: {
      control: 'boolean',
    },
    closeOnOutsideClick: {
      control: 'boolean',
    },
    confirmLabel: {
      control: 'text',
    },
    defaultOpen: {
      control: 'boolean',
    },
    description: {
      control: 'text',
    },
    focusTrap: {
      control: 'boolean',
    },
    isLoading: {
      control: 'boolean',
    },
    onCancel: {
      action: 'cancel',
    },
    onClosePrevented: {
      action: 'closePrevented',
    },
    onConfirm: {
      action: 'confirm',
    },
    onOpenChange: {
      action: 'openChange',
    },
    open: {
      control: false,
    },
    restoreFocus: {
      control: 'boolean',
    },
    scrollLock: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
  },
  parameters: {
    backgrounds: {
      default: 'black',
    },
  },
} satisfies Meta<typeof ConfirmModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ButtonOpenConfirmModalExample {...args} />,
};

export const Loading: Story = {
  render: () => <LoadingConfirmModalExample />,
};

export const Controlled: Story = {
  render: () => <ControlledConfirmModalExample />,
};

export const LongDescription: Story = {
  args: {
    description:
      '현재 작성 중인 내용은 새 버전으로 저장되며, 저장이 완료된 뒤에는 버전 목록에서 다시 확인할 수 있습니다.',
    title: '현재 내용을 새 버전으로 저장하시겠습니까?',
  },
  render: (args) => <ButtonOpenConfirmModalExample {...args} />,
};
