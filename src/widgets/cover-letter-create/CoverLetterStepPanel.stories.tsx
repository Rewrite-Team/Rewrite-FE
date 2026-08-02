import { CoverLetterStepPanel } from './CoverLetterStepPanel';

import type { Meta, StoryObj } from '@storybook/nextjs';

const handlePreviewAction = () => undefined;

const meta = {
  title: 'Widgets/CoverLetterCreate/StepPanel',
  component: CoverLetterStepPanel,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-black p-4">
        <div className="w-88">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step1: Story = {
  args: {
    currentStep: 1,
    highestCompletedStep: null,
    nextAction: { onClick: handlePreviewAction, status: 'enabled' },
    onStepSelect: handlePreviewAction,
    saveDraftAction: { status: 'disabled' },
  },
};

export const Step2: Story = {
  args: {
    currentStep: 2,
    highestCompletedStep: 1,
    nextAction: { onClick: handlePreviewAction, status: 'enabled' },
    onStepSelect: handlePreviewAction,
    saveDraftAction: { status: 'disabled' },
  },
};

export const Step3: Story = {
  args: {
    currentStep: 3,
    highestCompletedStep: 2,
    nextAction: { onClick: handlePreviewAction, status: 'enabled' },
    onStepSelect: handlePreviewAction,
    saveDraftAction: { status: 'disabled' },
  },
};

export const Step4: Story = {
  args: {
    completeAction: { status: 'disabled' },
    currentStep: 4,
    highestCompletedStep: 3,
    onStepSelect: handlePreviewAction,
  },
};
