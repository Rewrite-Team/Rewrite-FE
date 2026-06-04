import path from 'node:path';

import type { NextConfig } from 'next';

const svgComponentDirs = [
  path.join(process.cwd(), 'src/shared/assets/icons'),
  path.join(process.cwd(), 'src/shared/assets/logos'),
];

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        condition: {
          any: [
            { path: /^src\/shared\/assets\/icons\/.*\.svg$/ },
            { path: /^src\/shared\/assets\/logos\/.*\.svg$/ },
          ],
        },
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    const assetRule = config.module?.rules?.find(
      (rule: unknown): rule is { test: RegExp; exclude?: unknown } =>
        typeof rule === 'object' &&
        rule !== null &&
        'test' in rule &&
        rule.test instanceof RegExp &&
        rule.test.test('.svg')
    );

    if (assetRule) {
      const currentExclude = assetRule.exclude;

      assetRule.exclude = Array.isArray(currentExclude)
        ? [...currentExclude, ...svgComponentDirs]
        : currentExclude
          ? [currentExclude, ...svgComponentDirs]
          : svgComponentDirs;
    }

    config.module?.rules?.push({
      test: /\.svg$/i,
      include: svgComponentDirs,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
