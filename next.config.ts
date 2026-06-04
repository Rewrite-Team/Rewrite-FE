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
          loaders: [
            {
              loader: '@svgr/webpack',
              options: {
                svgo: true,
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                        },
                      },
                    },
                    'removeDimensions',
                  ],
                },
              },
            },
          ],
          as: '*.js',
        },
      ],
    },
  },
};

export default nextConfig;
