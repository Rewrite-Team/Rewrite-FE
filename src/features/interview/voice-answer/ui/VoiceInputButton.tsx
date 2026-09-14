import { VoiceRecordIcon } from '@/shared/assets/icons/interview';
import { cn } from '@/shared/styles/utils/cn';
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
 * 안내합니다. 미지원 버튼은 `aria-disabled`로 상태를 전달하면서 안내를 위해 포커스를
 * 유지하고, 클릭 동작만 실행하지 않습니다.
 */
export function VoiceInputButton({ isSupported, onStart }: VoiceInputButtonProps) {
  return (
    <Tooltip.Root offset={8} placement="top">
      <Tooltip.Trigger
        render={
          <Button
            aria-disabled={!isSupported || undefined}
            aria-label={isSupported ? '음성 입력 시작' : '음성 입력 미지원: Chrome을 사용해 주세요'}
            className={cn(
              'size-9 p-0 text-gray-200',
              isSupported ? 'hover:text-white' : 'cursor-not-allowed text-gray-500'
            )}
            iconOnly
            onClick={isSupported ? onStart : undefined}
            variant="ghost"
          >
            <VoiceRecordIcon aria-hidden className="size-6" />
          </Button>
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
