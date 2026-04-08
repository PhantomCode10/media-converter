/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 'standalone' output is only for Docker; Vercel uses standard Next.js output
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
  },
  // Proxy API requests to the backend during development
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [{ source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*` }]
      : [];
  },
};

module.exports = nextConfig;
