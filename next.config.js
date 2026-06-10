/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Linting is run separately — avoids ESLint v9 / next 14 incompatibility during build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
};

module.exports = nextConfig;
