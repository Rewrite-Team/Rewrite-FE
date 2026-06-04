import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': [
        {
          condition: {
            all: [
              {
                any: [
                  { path: /^src\/shared\/assets\/icons\/.*\.svg$/ },
                  { path: /^src\/shared\/assets\/logos\/.*\.svg$/ },
                ],
              },
              { query: '?url' },
            ],
          },
          type: 'asset',
        },
        {
          condition: {
            any: [
              { path: /^src\/shared\/assets\/icons\/.*\.svg$/ },
              { path: /^src\/shared\/assets\/logos\/.*\.svg$/ },
            ],
          },
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      ],
    },
  },
};

export default nextConfig;
