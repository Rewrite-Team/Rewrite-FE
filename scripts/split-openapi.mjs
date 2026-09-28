import { readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { format, resolveConfig } from 'prettier';

const ENTITY_NAMES = [
  'user',
  'cover-letter',
  'review-version',
  'keyword-analysis',
  'interview',
  'llm-job',
];

const HTTP_CLIENT_IMPORT_PATTERN = /^import \{ httpClient \} from ['"][^'"]+['"];\r?\n/m;
const FIRST_ENDPOINT_PATTERN = /\nexport const get[A-Za-z0-9_$]+Url\s*=/;
const EXPORTED_TYPE_PATTERN = /^export (?:interface|type) ([A-Za-z0-9_$]+)/gm;
const prettierConfig = (await resolveConfig(resolve('orval.config.ts'))) ?? {};

const splitEntityOutput = async (entityName) => {
  const apiDirectory = resolve(`src/entities/${entityName}/api`);
  const generatedPath = resolve(apiDirectory, '__generated.ts');
  const source = await readFile(generatedPath, 'utf8');
  const httpClientImport = source.match(HTTP_CLIENT_IMPORT_PATTERN);

  if (!httpClientImport || httpClientImport.index === undefined) {
    throw new Error(`${entityName}: 생성 코드에서 httpClient import를 찾지 못했습니다.`);
  }

  const header = source.slice(0, httpClientImport.index).trimEnd();
  const generatedBody = source.slice(httpClientImport.index + httpClientImport[0].length);
  const firstEndpoint = generatedBody.match(FIRST_ENDPOINT_PATTERN);

  if (!firstEndpoint || firstEndpoint.index === undefined) {
    throw new Error(`${entityName}: 생성 코드에서 첫 번째 API 함수를 찾지 못했습니다.`);
  }

  const typesBody = generatedBody.slice(0, firstEndpoint.index).trim();
  const apiBody = generatedBody.slice(firstEndpoint.index + 1).trim();
  const exportedTypeNames = [
    ...new Set([...typesBody.matchAll(EXPORTED_TYPE_PATTERN)].map((match) => match[1])),
  ];
  const typeImport = exportedTypeNames.length
    ? `\nimport type { ${exportedTypeNames.join(', ')} } from './types';\n`
    : '';
  const typesSource = await format(`${header}\n${typesBody}\n`, {
    ...prettierConfig,
    parser: 'typescript',
  });
  const apiSource = await format(
    `${header}\n${httpClientImport[0].trim()}${typeImport}\n${apiBody}\n`,
    { ...prettierConfig, parser: 'typescript' }
  );

  await Promise.all([
    writeFile(resolve(apiDirectory, 'types.ts'), typesSource, 'utf8'),
    writeFile(resolve(apiDirectory, 'api.ts'), apiSource, 'utf8'),
  ]);

  await unlink(generatedPath);
};

await Promise.all(ENTITY_NAMES.map(splitEntityOutput));
