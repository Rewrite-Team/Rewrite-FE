/** 현재 문서의 스크롤 위치를 즉시 맨 위로 이동합니다. */
export const scrollWindowToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};
