/** Input과 TextArea Field가 공유하는 크기, 배경, 테두리, 글자 스타일입니다. */
const fieldBaseClassName =
  'min-w-0 w-full rounded-lg border border-transparent bg-gray-600 px-5 body-16 text-white outline-none';

/** Input과 TextArea Field가 공유하는 focus, invalid, disabled 상태 스타일입니다. */
const fieldInteractionClassName =
  'transition-[border-color,box-shadow,background-color,color] duration-150 placeholder:text-gray-200 focus-visible:border-primary-500 focus-visible:shadow-[0_0_12px_2px] focus-visible:shadow-primary-500/25 data-[invalid=true]:border-error-500 data-[invalid=true]:focus-visible:shadow-error-500/25 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300 disabled:placeholder:text-gray-500';

export { fieldBaseClassName, fieldInteractionClassName };
