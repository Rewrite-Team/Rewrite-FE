import { defineConfig } from 'orval';

const createEntityConfig = (tag: string, entity: string) => ({
  input: {
    target: './openapi/rewrite.openapi.json',
    filters: {
      tags: [tag],
    },
  },
  output: {
    client: 'fetch' as const,
    mode: 'single' as const,
    target: `./src/entities/${entity}/api/__generated.ts`,
    override: {
      fetch: {
        includeHttpResponseReturnType: false,
      },
      mutator: {
        path: './src/shared/api/httpClient.ts',
        name: 'httpClient',
      },
    },
  },
});

export default defineConfig({
  user: createEntityConfig('인증', 'user'),
  coverLetter: createEntityConfig('자기소개서', 'cover-letter'),
  reviewVersion: createEntityConfig('첨삭 버전', 'review-version'),
  keywordAnalysis: createEntityConfig('키워드 분석', 'keyword-analysis'),
  interview: createEntityConfig('AI 면접', 'interview'),
  llmJob: createEntityConfig('LLM Job', 'llm-job'),
});
