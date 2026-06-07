import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: import('jest').Config = {
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  watchman: false,
};

export default createJestConfig(config);
