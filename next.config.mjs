/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is a placeholder config to satisfy the deployment system
  // The actual build is handled by Vite as configured in vercel.json
  reactStrictMode: true,
  images: {
    domains: ['assets.co.dev'],
  },
};

export default nextConfig;