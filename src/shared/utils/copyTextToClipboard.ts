/**
 * ## copyTextToClipboard
 *
 * @description
 * Clipboard API 지원 여부와 쓰기 실패를 한곳에서 처리하고 복사 성공 여부를 반환합니다.
 * 사용자에게 보여줄 메시지는 호출하는 화면에서 결정합니다.
 */
export const copyTextToClipboard = async (text: string) => {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
