import { VoiceRecordIcon } from '@/shared/assets/icons/interview';
import { Button } from '@/shared/ui/button';
import { Tooltip } from '@/shared/ui/tooltip';

interface VoiceInputButtonProps {
  isSupported: boolean;
  onStart: () => void;
}

/**
 * ## VoiceInputButton
 *
 * @description
 * 브라우저 음성 입력을 시작하며, 미지원 환경에서는 버튼을 비활성화하고 Chrome 사용을
 * 안내합니다. 비활성 버튼도 안내를 받을 수 있도록 포커스 가능한 래퍼를 사용합니다.
 */
export function VoiceInputButton({ isSupported, onStart }: VoiceInputButtonProps) {
  return (
    <Tooltip.Root offset={8} placement="top">
      <Tooltip.Trigger
        render={
          <span
            aria-label={!isSupported ? '음성 입력 미지원 안내' : undefined}
            className="inline-flex"
            tabIndex={!isSupported ? 0 : undefined}
          >
            <Button
              aria-label="음성 입력 시작"
              className="size-9 p-0 text-gray-200 data-[disabled=false]:hover:text-white"
              disabled={!isSupported}
              iconOnly
              onClick={onStart}
              variant="ghost"
            >
              <VoiceRecordIcon aria-hidden className="size-6" />
            </Button>
          </span>
        }
      />
      <Tooltip.Content>
        {isSupported
          ? '음성 입력은 Chrome에서 안정적으로 작동합니다.'
          : '이 브라우저에서는 음성 입력을 지원하지 않습니다. Chrome을 사용해 주세요.'}
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
