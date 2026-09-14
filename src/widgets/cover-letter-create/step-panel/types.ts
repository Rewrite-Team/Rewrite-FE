/** STEP 패널 버튼의 활성 상태와 실행 가능한 액션을 함께 표현합니다. */
export type StepPanelAction =
  | {
      /** 폼 제출 외에 별도 클릭 동작이 필요할 때 실행하는 콜백입니다. */
      onClick?: () => void;
      status: 'enabled';
    }
  | {
      status: 'disabled';
    };
