import type { ComponentProps } from 'react';

import { Button } from '@/shared/ui/button';

import { Tooltip } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

type TooltipStoryProps = ComponentProps<typeof Tooltip.Root>;

const PLACEMENT_EXAMPLES = [
  {
    description: '위에 표시됩니다.',
    gridClassName: 'col-start-2 row-start-1',
    label: 'Top',
    placement: 'top',
  },
  {
    description: '왼쪽에 표시됩니다.',
    gridClassName: 'col-start-1 row-start-2',
    label: 'Left',
    placement: 'left',
  },
  {
    description: '오른쪽에 표시됩니다.',
    gridClassName: 'col-start-3 row-start-2',
    label: 'Right',
    placement: 'right',
  },
  {
    description: '아래에 표시됩니다.',
    gridClassName: 'col-start-2 row-start-3',
    label: 'Bottom',
    placement: 'bottom',
  },
] satisfies Array<{
  description: string;
  gridClassName: string;
  label: string;
  placement: NonNullable<TooltipStoryProps['placement']>;
}>;

function TooltipExample(props: TooltipStoryProps) {
  return (
    <div className="flex min-h-72 items-center justify-center bg-black p-12">
      <Tooltip {...props}>
        <Tooltip.Trigger asChild>
          <Button aria-label="AI 첨삭 도움말" iconOnly variant="outline">
            ?
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          AI 첨삭 결과는 자기소개서 문항별로 생성됩니다.
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

const meta = {
  title: 'Shared/Tooltip',
  component: Tooltip.Root,
  tags: ['autodocs'],
  args: {
    children: null,
    defaultOpen: false,
    offset: 10,
    placement: 'top',
  },
  argTypes: {
    children: {
      control: false,
      table: {
        disable: true,
      },
    },
    offset: {
      control: 'number',
    },
    placement: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
    defaultOpen: {
      control: 'boolean',
    },
    onOpenChange: {
      action: 'openChange',
    },
    open: {
      control: false,
    },
  },
  parameters: {
    backgrounds: {
      default: 'black',
    },
  },
} satisfies Meta<typeof Tooltip.Root>;

export default meta;

type Story = StoryObj<TooltipStoryProps>;

export const Playground: Story = {
  render: (args) => <TooltipExample {...args} />,
};

export const Placements: Story = {
  render: () => (
    <div className="grid min-h-96 place-items-center bg-black p-16">
      <div className="grid grid-cols-3 items-center gap-6">
        <div className="col-start-2 row-start-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-4 text-center body-14 text-gray-100">
          Hover / Focus
        </div>
        {PLACEMENT_EXAMPLES.map(({ description, gridClassName, label, placement }) => (
          <Tooltip key={placement} placement={placement}>
            <Tooltip.Trigger asChild>
              <Button className={`w-28 ${gridClassName}`} variant="secondary">
                {label}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {description}
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip>
        ))}
      </div>
    </div>
  ),
};

export const TextTrigger: Story = {
  render: () => (
    <p className="min-h-64 bg-black p-12 body-16 text-gray-100">
      문장 안에서도{' '}
      <Tooltip placement="bottom">
        <Tooltip.Trigger asChild>
          <button className="rounded-sm text-primary-500 underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            키워드 분석
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          직무와 연결되는 핵심 표현을 추출해 보여줍니다.
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip>{' '}
      설명을 자연스럽게 연결할 수 있습니다.
    </p>
  ),
};
