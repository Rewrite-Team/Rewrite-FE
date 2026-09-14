import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

import { AIReviewRequirementModal } from '@/entities/review-version/ui/ai-review-requirement-modal/AIReviewRequirementModal';
import { INPUT_LIMITS } from '@/shared/constants/limits';
import { Button } from '@/shared/ui/button';

import type { Meta, StoryObj } from '@storybook/nextjs';

type AIReviewRequirementModalStoryProps = ComponentProps<typeof AIReviewRequirementModal>;

const DEFAULT_REQUIREMENT =
  '지원 직무와 직접 연결되는 경험을 먼저 제시하고, 성과는 수치로 보강해 주세요. 문장 끝 표현을 통일하면 자기소개서의 완성도가 더 높아집니다.';

const LONG_REQUIREMENT = Array.from(
  { length: 8 },
  (_, index) =>
    `${index + 1}. 문제 상황, 맡은 역할, 실행한 행동, 결과가 자연스럽게 이어지도록 문단을 분리해 주세요. 특히 결과 문장에는 정량 성과나 배운 점을 함께 작성하면 설득력이 높아집니다.`
).join('\n\n');

function ButtonOpenAIReviewRequirementModalExample(args: AIReviewRequirementModalStoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-100 items-center justify-center">
      <Button onClick={() => setIsOpen(true)}>AIReviewRequirementModal 열기</Button>
      <AIReviewRequirementModal {...args} onOpenChange={setIsOpen} open={isOpen} />
    </div>
  );
}

function ControlledAIReviewRequirementModalExample(args: AIReviewRequirementModalStoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [requirement, setRequirement] = useState(DEFAULT_REQUIREMENT);
  const [message, setMessage] = useState('대기 중');

  const handleConfirm = (value: string) => {
    args.onConfirm(value);
    setMessage(`재첨삭 요청: ${value.length}자`);
  };

  const handleOpenChange: AIReviewRequirementModalStoryProps['onOpenChange'] = (open, meta) => {
    args.onOpenChange?.(open, meta);
    setIsOpen(open);
  };

  const handleValueChange = (value: string) => {
    args.onValueChange?.(value);
    setRequirement(value);
  };

  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4">
      <Button onClick={() => setIsOpen(true)}>Controlled AIReviewRequirementModal 열기</Button>
      <p className="m-0 body-14 text-gray-100">{message}</p>
      <AIReviewRequirementModal
        {...args}
        onConfirm={handleConfirm}
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
        open={isOpen}
        value={requirement}
      />
    </div>
  );
}

function LoadingAIReviewRequirementModalExample(args: AIReviewRequirementModalStoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleConfirm = (value: string) => {
    args.onConfirm(value);
    setIsLoading(true);

    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      timerRef.current = null;
    }, 1200);
  };

  const handleOpenChange: AIReviewRequirementModalStoryProps['onOpenChange'] = (open, meta) => {
    args.onOpenChange?.(open, meta);
    setIsOpen(open);
  };

  return (
    <div className="flex min-h-100 items-center justify-center">
      <Button onClick={() => setIsOpen(true)}>Loading AIReviewRequirementModal 열기</Button>
      <AIReviewRequirementModal
        {...args}
        defaultValue={args.defaultValue ?? DEFAULT_REQUIREMENT}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onOpenChange={handleOpenChange}
        open={isOpen}
      />
    </div>
  );
}

const meta = {
  title: 'Entities/ReviewVersion/AIReviewRequirementModal',
  component: AIReviewRequirementModal,
  tags: ['autodocs'],
  args: {
    closeOnEscape: true,
    closeOnOutsideClick: true,
    confirmLabel: 'AI 첨삭 다시 받기',
    defaultOpen: false,
    defaultValue: DEFAULT_REQUIREMENT,
    focusTrap: true,
    isLoading: false,
    maxLength: INPUT_LIMITS.AI_REVIEW_REQUIREMENT,
    onConfirm: () => undefined,
    placeholder: 'AI 첨삭에 반영할 요구사항을 입력해 주세요.',
    restoreFocus: true,
    scrollLock: true,
    title: 'AI 첨삭 요구사항',
    textareaDisabled: false,
  },
  argTypes: {
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
    defaultValue: {
      control: 'text',
    },
    focusTrap: {
      control: 'boolean',
    },
    isLoading: {
      control: 'boolean',
    },
    maxLength: {
      control: { min: 1, type: 'number' },
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
    onValueChange: {
      action: 'valueChange',
    },
    open: {
      control: false,
    },
    placeholder: {
      control: 'text',
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
    textareaDisabled: {
      control: 'boolean',
    },
    value: {
      control: false,
    },
  },
} satisfies Meta<typeof AIReviewRequirementModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ButtonOpenAIReviewRequirementModalExample {...args} />,
};

export const Controlled: Story = {
  render: (args) => <ControlledAIReviewRequirementModalExample {...args} />,
};

export const LongText: Story = {
  args: {
    defaultValue: LONG_REQUIREMENT,
  },
  render: (args) => <ButtonOpenAIReviewRequirementModalExample {...args} />,
};

export const Loading: Story = {
  render: (args) => <LoadingAIReviewRequirementModalExample {...args} />,
};
