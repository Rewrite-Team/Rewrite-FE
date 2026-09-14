import { toast } from 'react-toastify';

import type { Id, ToastContent, ToastOptions, ToastPosition } from 'react-toastify';

export const TOAST_AUTO_CLOSE = 4_000;
export const TOAST_POSITION = 'bottom-right' satisfies ToastPosition;

type AppToastType = 'success' | 'error' | 'info' | 'warning';

export type AppToastOptions = Pick<
  ToastOptions,
  'ariaLabel' | 'autoClose' | 'onClose' | 'position' | 'role' | 'toastId'
>;

const createToastId = (type: AppToastType, message: ToastContent): Id | undefined => {
  if (typeof message !== 'string' && typeof message !== 'number') {
    return undefined;
  }

  return `app-toast:${type}:${message}`;
};

const showToast = (type: AppToastType, message: ToastContent, options?: AppToastOptions) => {
  const toastId = options?.toastId ?? createToastId(type, message);
  const role = options?.role ?? (type === 'success' || type === 'info' ? 'status' : 'alert');

  return toast(message, {
    ...options,
    role,
    toastId,
    type,
  });
};

/**
 * ## appToast
 *
 * @description
 * 성공, 실패, 안내, 경고 메시지를 동일한 설정으로 표시하는 공통 Toast API입니다.
 * 같은 종류와 내용의 문자열 Toast는 현재 표시 중인 동안 중복 생성되지 않습니다.
 * ReactNode 메시지를 중복 방지하려면 options에 고정된 `toastId`를 전달합니다.
 *
 * @example
 * ```tsx
 * appToast.success('저장되었습니다.');
 * appToast.error('저장에 실패했습니다.', { autoClose: 6000 });
 * appToast.info('분석을 시작합니다.', { position: 'bottom-center' });
 * appToast.warning('입력 내용을 다시 확인해 주세요.');
 * ```
 */
export const appToast = {
  error: (message: ToastContent, options?: AppToastOptions) => showToast('error', message, options),
  info: (message: ToastContent, options?: AppToastOptions) => showToast('info', message, options),
  success: (message: ToastContent, options?: AppToastOptions) =>
    showToast('success', message, options),
  warning: (message: ToastContent, options?: AppToastOptions) =>
    showToast('warning', message, options),
};
