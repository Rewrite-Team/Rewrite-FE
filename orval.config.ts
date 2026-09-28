import { defineConfig, defineTransformer } from 'orval';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;
const EXCLUDED_OPERATION_IDS = new Set([
  'handleKakaoCallback',
  'startKakaoLogin',
  'streamCoverLetterReviewStatuses',
  'streamLlmJobEvents',
]);

const excludeNonJsonOperations = defineTransformer((spec) => {
  for (const [route, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!pathItem) continue;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];

      if (operation?.operationId && EXCLUDED_OPERATION_IDS.has(operation.operationId)) {
        delete pathItem[method];
      }
    }

    if (!HTTP_METHODS.some((method) => pathItem[method])) {
      delete spec.paths?.[route];
    }
  }

  return spec;
});

const createEntityConfig = (tag: string, entity: string) => ({
  input: {
    target: './openapi/rewrite.openapi.json',
    override: {
      transformer: excludeNonJsonOperations,
    },
    filters: {
      tags: [tag],
    },
  },
  output: {
    client: 'fetch' as const,
    formatter: 'prettier' as const,
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
