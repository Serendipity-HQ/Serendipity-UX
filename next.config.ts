import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@serendipity-hq/design', '@serendipity-hq/ui', '@serendipity-hq/algorithm'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
