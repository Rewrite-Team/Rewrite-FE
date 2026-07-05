import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TODO: 백엔드 프로필 이미지 호스트가 확정되면 images.remotePatterns에 허용 도메인 추가 필요
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
