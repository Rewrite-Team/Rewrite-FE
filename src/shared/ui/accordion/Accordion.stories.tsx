import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { TextArea } from '@/shared/ui/textarea';

import { Accordion } from './index';

import type { Meta, StoryObj } from '@storybook/nextjs';

interface AccordionPlaygroundProps {
  disabled: boolean;
}

interface ExclusiveAccordionExampleProps {
  disabled?: boolean;
}

function ExclusiveAccordionExample({ disabled = false }: ExclusiveAccordionExampleProps) {
  const [openValue, setOpenValue] = useState<string | undefined>('first');

  const handleOpenChange = (value: string) => (open: boolean) => {
    setOpenValue(open ? value : undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <Accordion
        disabled={disabled}
        onOpenChange={handleOpenChange('first')}
        open={openValue === 'first'}
      >
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="첫 번째 섹션 영역 접기/펼치기" />
            <Accordion.Label>첫 번째 섹션</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">처음에는 이 Accordion만 열린 상태입니다.</p>
        </Accordion.Content>
      </Accordion>

      <Accordion
        disabled={disabled}
        onOpenChange={handleOpenChange('second')}
        open={openValue === 'second'}
      >
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="두 번째 섹션 영역 접기/펼치기" />
            <Accordion.Label>두 번째 섹션</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">
            이 Accordion을 열면 첫 번째 Accordion은 닫힙니다.
          </p>
        </Accordion.Content>
      </Accordion>

      <Accordion
        disabled={disabled}
        onOpenChange={handleOpenChange('third')}
        open={openValue === 'third'}
      >
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="세 번째 섹션 영역 접기/펼치기" />
            <Accordion.Label>세 번째 섹션</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">
            독립된 Accordion들이 하나의 exclusive 그룹처럼 동작합니다.
          </p>
        </Accordion.Content>
      </Accordion>
    </div>
  );
}

function CoverLetterInputSections() {
  return (
    <Accordion defaultOpen>
      <Accordion.Header>
        <Input id="storybook-question" required>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="질문 영역 접기/펼치기" />
            <Accordion.Label asChild>
              <Input.Label>질문</Input.Label>
            </Accordion.Label>
          </div>
          <div className="pt-3">
            <Input.Field aria-label="질문" placeholder="이름이 무엇입니까?" />
            <Input.ErrorMessage>질문을 입력해 주세요.</Input.ErrorMessage>
          </div>
        </Input>
      </Accordion.Header>

      <Accordion.Content>
        <TextArea id="storybook-original-answer" required>
          <TextArea.Label>내가 쓴 자기소개서</TextArea.Label>
          <TextArea.Field placeholder="이사람입니다람쥐~" recommendedLength={700} showCount />
          <TextArea.ErrorMessage>자기소개서 내용을 입력해 주세요.</TextArea.ErrorMessage>
        </TextArea>

        <TextArea id="storybook-diff">
          <TextArea.Label>Diff</TextArea.Label>
          <TextArea.Field placeholder="이사람입니다람쥐~" />
          <TextArea.ErrorMessage />
        </TextArea>

        <TextArea id="storybook-final-answer" required>
          <div className="flex items-end justify-between gap-3">
            <div>
              <TextArea.Label className="mb-0">최종 작성본</TextArea.Label>
              <p className="mt-1 mb-0 body-12 text-gray-100">
                첨삭 내용을 참고하여 최종 작성본을 완성해 보세요.
              </p>
            </div>
            <Button size="sm" type="button">
              저장
            </Button>
          </div>
          <div className="pt-3">
            <TextArea.Field placeholder="이사람입니다람쥐~" recommendedLength={700} showCount />
          </div>
          <TextArea.ErrorMessage>최종 작성본을 입력해 주세요.</TextArea.ErrorMessage>
        </TextArea>
      </Accordion.Content>
    </Accordion>
  );
}

function IndependentControlledAccordionExample() {
  const [isProfileOpen, setIsProfileOpen] = useState(true);
  const [isResultOpen, setIsResultOpen] = useState(true);

  return (
    <div className="flex w-full flex-col gap-6">
      <Accordion onOpenChange={setIsProfileOpen} open={isProfileOpen}>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="프로필 입력 영역 접기/펼치기" />
            <Accordion.Label>프로필 입력</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <Input id="controlled-profile-title">
            <Input.Label>자기소개서 제목</Input.Label>
            <Input.Field placeholder="카카오 자기소개서" />
            <Input.ErrorMessage />
          </Input>
        </Accordion.Content>
      </Accordion>

      <Accordion onOpenChange={setIsResultOpen} open={isResultOpen}>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="분석 결과 영역 접기/펼치기" />
            <Accordion.Label>분석 결과</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <TextArea id="controlled-analysis-result">
            <TextArea.Label>키워드 분석 메모</TextArea.Label>
            <TextArea.Field placeholder="분석 결과를 메모해 주세요." />
            <TextArea.ErrorMessage />
          </TextArea>
        </Accordion.Content>
      </Accordion>
    </div>
  );
}

const meta = {
  title: 'Shared/Accordion',
  component: Accordion,
  args: {
    disabled: false,
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: '전체 Accordion 비활성화 여부',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-200 max-w-[calc(100vw-2rem)] p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<AccordionPlaygroundProps>;

export const ExclusiveControlled: Story = {
  render: ({ disabled }) => <ExclusiveAccordionExample disabled={disabled} />,
};

export const Independent: Story = {
  render: ({ disabled }) => (
    <div className="flex flex-col gap-6">
      <Accordion defaultOpen disabled={disabled}>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="질문 영역 접기/펼치기" />
            <Accordion.Label>질문</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">첫 번째 Accordion의 질문 영역입니다.</p>
        </Accordion.Content>
      </Accordion>

      <Accordion defaultOpen disabled={disabled}>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="답변 영역 접기/펼치기" />
            <Accordion.Label>답변</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">두 번째 Accordion의 답변 영역입니다.</p>
        </Accordion.Content>
      </Accordion>

      <Accordion defaultOpen disabled={disabled}>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="최종 작성본 영역 접기/펼치기" />
            <Accordion.Label>최종 작성본</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">세 번째 Accordion의 최종 작성본 영역입니다.</p>
        </Accordion.Content>
      </Accordion>
    </div>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Accordion>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="질문 영역 접기/펼치기" />
            <Accordion.Label>질문</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">defaultOpen이 없어 닫힌 상태로 시작합니다.</p>
        </Accordion.Content>
      </Accordion>

      <Accordion defaultOpen>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="내가 쓴 자기소개서 영역 접기/펼치기" />
            <Accordion.Label>내가 쓴 자기소개서</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">defaultOpen으로 열린 상태를 지정합니다.</p>
        </Accordion.Content>
      </Accordion>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => <IndependentControlledAccordionExample />,
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Accordion defaultOpen>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-white">
            <Accordion.Trigger aria-label="활성 섹션 영역 접기/펼치기" />
            <Accordion.Label>활성 섹션</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">클릭과 키보드 입력이 가능합니다.</p>
        </Accordion.Content>
      </Accordion>

      <Accordion disabled>
        <Accordion.Header>
          <div className="flex items-center gap-2 text-gray-400">
            <Accordion.Trigger aria-label="비활성 섹션 영역 접기/펼치기" />
            <Accordion.Label>비활성 섹션</Accordion.Label>
          </div>
        </Accordion.Header>
        <Accordion.Content>
          <p className="m-0 body-14 text-gray-100">비활성 섹션은 열리지 않습니다.</p>
        </Accordion.Content>
      </Accordion>
    </div>
  ),
};

export const CoverLetterInputs: Story = {
  render: () => <CoverLetterInputSections />,
};
