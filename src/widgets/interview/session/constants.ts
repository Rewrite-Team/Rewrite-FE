const RECORDING_WAVEFORM_PATTERN = [
  2, 2, 3, 2, 4, 3, 2, 3, 6, 3, 8, 5, 12, 7, 16, 10, 18, 12, 20, 14, 17, 9, 15, 11, 19, 13, 18, 10,
  16, 8, 14, 7, 12, 6, 10, 5, 9, 4, 7, 3, 3, 2, 4, 3, 10, 6, 14, 8, 11, 7, 9, 5, 6, 4, 5, 3, 4, 2,
  3, 2, 2, 3, 2, 2,
];

const REVERSED_RECORDING_WAVEFORM_PATTERN = [...RECORDING_WAVEFORM_PATTERN].reverse();

/**
 * 실제 음성 분석 데이터가 연결되기 전 녹음 상태를 표현하는 파형 높이입니다.
 * 넓은 입력창도 채우면서 반복 경계가 두드러지지 않도록 정방향과 역방향을 교차합니다.
 */
export const RECORDING_WAVEFORM_HEIGHTS = [
  ...RECORDING_WAVEFORM_PATTERN,
  ...REVERSED_RECORDING_WAVEFORM_PATTERN,
  ...RECORDING_WAVEFORM_PATTERN,
  ...REVERSED_RECORDING_WAVEFORM_PATTERN,
];
