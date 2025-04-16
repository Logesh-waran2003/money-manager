/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Don't run ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't run TypeScript checking during production builds
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
