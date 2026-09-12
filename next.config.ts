import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  distDir: process.env.DOTNEET_BUILD_DIR || '.next',
  serverExternalPackages: ['@nimiq/core'],
};
export default nextConfig;
