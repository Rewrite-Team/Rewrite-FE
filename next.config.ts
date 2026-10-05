import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'img1.kakaocdn.net',
        pathname: '/thumb/**',
      },
    ],
  },
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
                  plugins: ['preset-default', 'removeDimensions'],
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
