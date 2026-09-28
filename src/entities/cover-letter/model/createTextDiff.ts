import { diffWordsWithSpace } from 'diff';

type TextDiffPartType = 'added' | 'equal' | 'removed';

export interface TextDiffPart {
  type: TextDiffPartType;
  value: string;
}

/** 원문과 첨삭본을 단어와 공백 단위로 비교해 렌더링 가능한 조각으로 변환합니다. */
export const createTextDiff = (original: string, reviewed: string): TextDiffPart[] =>
  diffWordsWithSpace(original, reviewed).map((part) => ({
    type: part.added ? 'added' : part.removed ? 'removed' : 'equal',
    value: part.value,
  }));
