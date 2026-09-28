import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_SCHEMA_URL = 'https://api.rewrite-coverletters.site/v3/api-docs';
const OUTPUT_PATH = resolve('openapi/rewrite.openapi.json');
const TEMP_OUTPUT_PATH = `${OUTPUT_PATH}.tmp`;

const schemaUrl = process.env.OPENAPI_SCHEMA_URL ?? DEFAULT_SCHEMA_URL;

const response = await fetch(schemaUrl, {
  headers: {
    accept: 'application/json',
  },
});

if (!response.ok) {
  throw new Error(`OpenAPI 명세 요청에 실패했습니다. (${response.status} ${response.statusText})`);
}

const schema = await response.json();

if (!schema || typeof schema !== 'object' || typeof schema.openapi !== 'string') {
  throw new Error('응답이 올바른 OpenAPI 명세가 아닙니다.');
}

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(TEMP_OUTPUT_PATH, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
await rename(TEMP_OUTPUT_PATH, OUTPUT_PATH);

// CLI 실행 결과에 저장된 명세 버전과 경로를 표시합니다.
// eslint-disable-next-line no-console
console.log(`OpenAPI ${schema.openapi} 명세를 ${OUTPUT_PATH}에 저장했습니다.`);
