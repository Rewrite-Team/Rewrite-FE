import type { ApiErrorDetail } from '@/shared/api';

type CoverLetterValidationFieldError =
  | { step: 1; field: 'title' | 'companyName' | 'positionTitle' | 'jobPostingUrl'; reason: string }
  | { step: 2; field: 'preferredQualification'; reason: string }
  | {
      step: 3;
      field: `questions.${number}.${'question' | 'answer' | 'characterLimit'}` | 'root.questions';
      index: number;
      reason: string;
    };

/** 저장·제출 응답의 백엔드 검증 오류를 단계별 폼 필드로 변환합니다. */
export function mapCoverLetterValidationErrors(
  details: ApiErrorDetail[]
): CoverLetterValidationFieldError[] {
  return details.flatMap((detail): CoverLetterValidationFieldError[] => {
    const reason = detail.reason ?? '입력값을 확인해 주세요.';
    const field = detail.field;
    if (
      field === 'title' ||
      field === 'companyName' ||
      field === 'positionTitle' ||
      field === 'jobPostingUrl'
    )
      return [{ step: 1, field, reason }];
    if (field === 'preferences') return [{ step: 2, field: 'preferredQualification', reason }];
    if (field === 'questions') return [{ step: 3, field: 'root.questions', index: 0, reason }];
    const match = field?.match(/^questions\[(\d+)\]\.(question|originalAnswer|maxAnswerLength)$/);
    if (!match) return [];
    const index = Number(match[1]);
    const inputField =
      match[2] === 'originalAnswer'
        ? 'answer'
        : match[2] === 'maxAnswerLength'
          ? 'characterLimit'
          : 'question';
    return [{ step: 3, field: `questions.${index}.${inputField}`, index, reason }];
  });
}

export type { CoverLetterValidationFieldError };
