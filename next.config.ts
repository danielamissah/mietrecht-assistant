import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output bundles everything needed to run the app
  // into a single .next/standalone directory — required for Docker multi-stage builds
  output: 'standalone',
};

export default nextConfig;