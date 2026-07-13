'use client';

import * as Toastify from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { TOAST_AUTO_CLOSE, TOAST_POSITION } from '@/shared/lib/toast';

import '@/shared/styles/components/toast.css';

/**
 * ## ToastContainer
 *
 * @description
 * 서비스 전역 Toast가 렌더링되는 공통 컨테이너입니다.
 * 루트 레이아웃에 한 번만 배치하고, 화면에서는 `appToast` API로 메시지를 표시합니다.
 *
 * ### 접근성
 *
 * 알림 영역에 이름을 제공합니다. 성공과 안내 Toast는 `status` 역할로 부드럽게 전달하고,
 * 오류와 경고 Toast는 즉시 확인할 수 있도록 `alert` 역할로 전달합니다.
 * 호출부에서 `role` 옵션을 지정하면 기본 역할을 재정의할 수 있습니다.
 *
 * @example
 * ```tsx
 * <body>
 *   {children}
 *   <ToastContainer />
 * </body>
 * ```
 */
export function ToastContainer() {
  return (
    <Toastify.ToastContainer
      aria-label="알림"
      autoClose={TOAST_AUTO_CLOSE}
      closeOnClick={false}
      draggable="touch"
      hideProgressBar={false}
      limit={4}
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      position={TOAST_POSITION}
      theme="dark"
    />
  );
}
