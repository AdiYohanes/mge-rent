/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'export',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['mge.168.231.84.221.sslip.io'],
    unoptimized: true, // Use this for better handling of external images
  },
};

module.exports = nextConfig;
