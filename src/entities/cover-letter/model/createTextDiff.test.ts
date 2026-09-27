import { createTextDiff } from './createTextDiff';

describe('createTextDiff', () => {
  it('공백을 유지하면서 추가·삭제된 단어를 구분한다', () => {
    expect(createTextDiff('사용자를 생각합니다.', '사용자를 먼저 생각합니다.')).toEqual([
      { type: 'equal', value: '사용자를 ' },
      { type: 'added', value: '먼저 ' },
      { type: 'equal', value: '생각합니다.' },
    ]);
  });
});
