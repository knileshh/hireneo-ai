import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker deployment
  output: 'standalone',

  // External packages for serverless compatibility
  serverExternalPackages: ['bullmq', 'ioredis'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
