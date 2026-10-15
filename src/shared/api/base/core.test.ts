import { ApiError } from './apiError';
import { request } from './core';

interface MockResponseOptions {
  body?: unknown;
  contentType?: string;
  jsonError?: Error;
  ok?: boolean;
  status?: number;
  text?: string;
}

const createMockResponse = ({
  body,
  contentType = 'application/json',
  jsonError,
  ok = true,
  status = 200,
  text = '',
}: MockResponseOptions): Response =>
  ({
    headers: {
      get: jest.fn(() => contentType),
    },
    json: jest.fn(() => (jsonError ? Promise.reject(jsonError) : Promise.resolve(body))),
    ok,
    status,
    text: jest.fn(() => Promise.resolve(text)),
  }) as unknown as Response;

describe('request', () => {
  const fetchMock = jest.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
      return;
    }

    Reflect.deleteProperty(globalThis, 'fetch');
  });

  it.each(['application/problem+json', 'Application/Vnd.Api+Json; charset=UTF-8'])(
    '%s 응답을 JSON으로 파싱한다',
    async (contentType) => {
      const body = { success: true };
      const response = createMockResponse({ body, contentType });
      fetchMock.mockResolvedValue(response);

      await expect(
        request('https://example.com/test', {}, 'https://api.example.com')
      ).resolves.toEqual(body);
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(response.text).not.toHaveBeenCalled();
    }
  );

  it('오류 응답의 JSON 파싱이 실패해도 HTTP 상태를 ApiError로 보존한다', async () => {
    const response = createMockResponse({
      jsonError: new SyntaxError('Unexpected end of JSON input'),
      ok: false,
      status: 502,
    });
    fetchMock.mockResolvedValue(response);

    await expect(
      request('https://example.com/test', {}, 'https://api.example.com')
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
    } satisfies Partial<ApiError>);
  });

  it('정상 응답의 JSON 파싱 오류는 원래 오류를 전달한다', async () => {
    const jsonError = new SyntaxError('Unexpected end of JSON input');
    fetchMock.mockResolvedValue(createMockResponse({ jsonError }));

    await expect(request('https://example.com/test', {}, 'https://api.example.com')).rejects.toBe(
      jsonError
    );
  });
});
