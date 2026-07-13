import { toast } from 'react-toastify';

import { appToast } from './toast';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockedToast = jest.mocked(toast);

describe('appToast', () => {
  beforeEach(() => {
    mockedToast.mockClear();
  });

  it.each(['success', 'error', 'info', 'warning'] as const)(
    '%s 타입으로 Toast를 표시한다',
    (type) => {
      appToast[type]('알림 메시지');

      expect(mockedToast).toHaveBeenCalledWith('알림 메시지', expect.objectContaining({ type }));
    }
  );

  it('같은 타입과 메시지에 동일한 toastId를 사용한다', () => {
    appToast.success('저장되었습니다.');
    appToast.success('저장되었습니다.');

    const firstOptions = mockedToast.mock.calls[0]?.[1];
    const secondOptions = mockedToast.mock.calls[1]?.[1];

    expect(firstOptions?.toastId).toBeDefined();
    expect(secondOptions?.toastId).toBe(firstOptions?.toastId);
  });

  it('같은 메시지라도 타입이 다르면 서로 다른 toastId를 사용한다', () => {
    appToast.success('완료');
    appToast.error('완료');

    const successOptions = mockedToast.mock.calls[0]?.[1];
    const errorOptions = mockedToast.mock.calls[1]?.[1];

    expect(successOptions?.toastId).not.toBe(errorOptions?.toastId);
  });

  it('같은 타입이라도 메시지가 다르면 서로 다른 toastId를 사용한다', () => {
    appToast.info('분석 시작');
    appToast.info('분석 완료');

    const startOptions = mockedToast.mock.calls[0]?.[1];
    const completeOptions = mockedToast.mock.calls[1]?.[1];

    expect(startOptions?.toastId).not.toBe(completeOptions?.toastId);
  });

  it.each([
    ['success', 'status'],
    ['info', 'status'],
    ['error', 'alert'],
    ['warning', 'alert'],
  ] as const)('%s 타입에 %s 역할을 기본 적용한다', (type, role) => {
    appToast[type]('알림 메시지');

    expect(mockedToast).toHaveBeenCalledWith('알림 메시지', expect.objectContaining({ role }));
  });

  it('호출부에서 지정한 옵션과 toastId를 유지한다', () => {
    appToast.info('안내 메시지', {
      autoClose: 6_000,
      position: 'bottom-center',
      toastId: 'custom-toast',
    });

    expect(mockedToast).toHaveBeenCalledWith('안내 메시지', {
      autoClose: 6_000,
      position: 'bottom-center',
      role: 'status',
      toastId: 'custom-toast',
      type: 'info',
    });
  });

  it('호출부에서 지정한 접근성 역할을 유지한다', () => {
    appToast.info('즉시 확인이 필요한 안내', { role: 'alert' });

    expect(mockedToast).toHaveBeenCalledWith(
      '즉시 확인이 필요한 안내',
      expect.objectContaining({ role: 'alert' })
    );
  });
});
