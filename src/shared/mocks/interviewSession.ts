const MOCK_INTERVIEW_QUESTION_PROMPTS = [
  '지원 동기와 입사 후 이루고 싶은 목표를 말씀해 주세요.',
  '프로젝트에서 가장 어려웠던 문제와 해결 과정을 설명해 주세요.',
  '브라우저 렌더링 과정에서 DOM, CSSOM, Render Tree의 역할은 무엇인가요?',
  '팀원과 의견이 달랐을 때 어떻게 합의점을 찾았나요?',
  '본인의 강점이 지원한 직무에 어떻게 도움이 될 수 있나요?',
  '협업 과정에서 동료의 피드백을 반영해 결과를 개선한 경험이 있나요?',
];

/** 면접 세션 API 연결 전 질문 목록과 대화 화면에서 사용하는 목데이터입니다. */
export const MOCK_INTERVIEW_QUESTIONS = MOCK_INTERVIEW_QUESTION_PROMPTS.map((prompt, index) => ({
  id: index + 1,
  prompt,
  messages:
    index === 0
      ? [
          { id: 1, role: 'assistant' as const, content: prompt },
          { id: 2, role: 'user' as const, content: '답변답변' },
          { id: 3, role: 'assistant' as const, content: '답변답변' },
          { id: 4, role: 'user' as const, content: '답변답변' },
        ]
      : [{ id: 1, role: 'assistant' as const, content: prompt }],
}));
