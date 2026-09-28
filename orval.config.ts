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
        path: '@/shared/api/httpClient',
        name: 'httpClient',
      },
    },
  },
});

export default defineConfig({
  user: createEntityConfig('Auth', 'user'),
  coverLetter: createEntityConfig('CoverLetters', 'cover-letter'),
  reviewVersion: createEntityConfig('ReviewVersions', 'review-version'),
  keywordAnalysis: createEntityConfig('KeywordAnalysis', 'keyword-analysis'),
  interview: createEntityConfig('Interviews', 'interview'),
  llmJob: createEntityConfig('LLMJobs', 'llm-job'),
});
