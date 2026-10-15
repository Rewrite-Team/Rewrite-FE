import { mapCoverLetterValidationErrors } from './mapCoverLetterValidationErrors';

describe('mapCoverLetterValidationErrors', () => {
  it('백엔드 필드를 해당 단계의 입력 이름으로 변환한다', () => {
    expect(
      mapCoverLetterValidationErrors([
        { field: 'title', reason: '제목 오류' },
        { field: 'preferences', reason: '우대사항 오류' },
        { field: 'questions[1].originalAnswer', reason: '답변 오류' },
        { field: 'questions[0].maxAnswerLength', reason: '글자 수 오류' },
        { field: 'questions[0].question', reason: '질문 오류' },
      ])
    ).toEqual([
      { step: 1, field: 'title', reason: '제목 오류' },
      { step: 2, field: 'preferredQualification', reason: '우대사항 오류' },
      { step: 3, field: 'questions.1.answer', index: 1, reason: '답변 오류' },
      { step: 3, field: 'questions.0.characterLimit', index: 0, reason: '글자 수 오류' },
      { step: 3, field: 'questions.0.question', index: 0, reason: '질문 오류' },
    ]);
  });
  it('문항 전체 오류를 STEP3의 폼 오류에 연결한다', () => {
    expect(
      mapCoverLetterValidationErrors([{ field: 'questions', reason: '문항이 필요합니다.' }])
    ).toEqual([{ step: 3, field: 'root.questions', index: 0, reason: '문항이 필요합니다.' }]);
  });
  it('알 수 없는 필드와 점으로 표기한 문항 인덱스는 매핑하지 않는다', () => {
    expect(
      mapCoverLetterValidationErrors([
        { field: 'unknown' },
        { field: 'questions.0.originalAnswer' },
      ])
    ).toEqual([]);
  });
});
