import { copyTextToClipboard } from './copyTextToClipboard';

describe('copyTextToClipboard', () => {
  it('Clipboard API로 텍스트를 복사하고 성공 여부를 반환한다', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await expect(copyTextToClipboard('복사할 내용')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('복사할 내용');
  });

  it('Clipboard API를 지원하지 않으면 실패 여부를 반환한다', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    await expect(copyTextToClipboard('복사할 내용')).resolves.toBe(false);
  });

  it('브라우저의 복사 요청이 거부되면 실패 여부를 반환한다', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    });

    await expect(copyTextToClipboard('복사할 내용')).resolves.toBe(false);
  });
});
