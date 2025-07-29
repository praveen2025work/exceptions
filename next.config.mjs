/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['assets.co.dev'],
  },
  // Remove these if you want to deploy to root directory
  // assetPrefix: '/exception-hub',
  // basePath: '/exception-hub',
};

export default nextConfig;