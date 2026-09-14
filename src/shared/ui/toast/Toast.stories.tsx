import { appToast } from '@/shared/lib/toast';
import { Button } from '@/shared/ui/button';

import { ToastContainer } from './ToastContainer';

import type { Meta, StoryObj } from '@storybook/nextjs';

const TOAST_EXAMPLES = [
  { label: 'Success Toast', message: '자기소개서가 저장되었습니다.', type: 'success' },
  { label: 'Error Toast', message: '저장에 실패했습니다. 다시 시도해 주세요.', type: 'error' },
  { label: 'Info Toast', message: 'AI 첨삭을 시작합니다.', type: 'info' },
  { label: 'Warning Toast', message: '필수 입력 항목을 확인해 주세요.', type: 'warning' },
] as const;

const meta = {
  title: 'Shared/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ToastContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Types: Story = {
  render: () => (
    <main className="flex min-h-80 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-wrap justify-center gap-3">
        {TOAST_EXAMPLES.map(({ label, message, type }) => (
          <Button key={type} onClick={() => appToast[type](message)} variant="outline">
            {label}
          </Button>
        ))}
      </div>
      <p className="body-14 text-gray-100">
        같은 버튼을 연속으로 눌러도 동일한 Toast는 중복 표시되지 않습니다.
      </p>
      <ToastContainer />
    </main>
  ),
};

export const PositionAndAutoClose: Story = {
  render: () => (
    <main className="flex min-h-80 items-center justify-center p-8">
      <Button
        onClick={() =>
          appToast.info('하단 중앙에서 6초 동안 표시됩니다.', {
            autoClose: 6_000,
            position: 'bottom-center',
          })
        }
      >
        옵션 적용 Toast
      </Button>
      <ToastContainer />
    </main>
  ),
};

export const LongMessage: Story = {
  render: () => (
    <main className="flex min-h-80 items-center justify-center p-8">
      <Button
        onClick={() =>
          appToast.warning(
            '입력한 자기소개서 내용을 저장하지 못했습니다. 네트워크 연결 상태를 확인한 후 잠시 뒤 다시 시도해 주세요.',
            { autoClose: 10_000 }
          )
        }
        variant="outline"
      >
        긴 메시지 Toast
      </Button>
      <ToastContainer />
    </main>
  ),
};
