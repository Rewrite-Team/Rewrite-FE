import tanstackQuery from '@tanstack/eslint-plugin-query';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import boundaries from 'eslint-plugin-boundaries';
import { createNodeResolver, flatConfigs as importXConfigs } from 'eslint-plugin-import-x';
import { configs as storybookConfigs } from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  importXConfigs.recommended,
  importXConfigs.typescript,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    plugins: {
      boundaries,
      '@tanstack/query': tanstackQuery,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'src/app/**/*',
        },
        {
          type: 'widgets',
          pattern: 'src/widgets/**/*',
        },
        {
          type: 'features',
          pattern: 'src/features/**/*',
        },
        {
          type: 'entities',
          pattern: 'src/entities/**/*',
        },
        {
          type: 'shared',
          pattern: 'src/shared/**/*',
        },
      ],
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: './tsconfig.json',
        }),
        createNodeResolver({
          extensions: ['.mjs', '.cjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.node', '.css'],
        }),
      ],
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: {
                to: [
                  { type: 'app' },
                  { type: 'widgets' },
                  { type: 'features' },
                  { type: 'entities' },
                  { type: 'shared' },
                ],
              },
            },
            {
              from: { type: 'widgets' },
              allow: { to: [{ type: 'features' }, { type: 'entities' }, { type: 'shared' }] },
            },
            {
              from: { type: 'features' },
              allow: { to: [{ type: 'entities' }, { type: 'shared' }] },
            },
            {
              from: { type: 'entities' },
              allow: { to: [{ type: 'shared' }] },
            },
            {
              from: { type: 'shared' },
              allow: { to: [{ type: 'shared' }] },
            },
          ],
        },
      ],
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-pascal-case': 'error',
      'react/prop-types': 'off',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      curly: ['error'],
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  prettier,
  ...storybookConfigs['flat/recommended'],
  globalIgnores(['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
