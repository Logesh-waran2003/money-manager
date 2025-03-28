/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Enable static optimization where possible
  reactStrictMode: true,
  // Improve performance with image optimization
  images: {
    domains: [],
  },
  // Add any necessary redirects
  async redirects() {
    return [];
  },
};

export default nextConfig;
