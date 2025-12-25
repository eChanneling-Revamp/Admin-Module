/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://your-app-name.vercel.app/api/:path*'
          : 'http://localhost:5000/api/:path*',
      },
    ]
  },
}

export default nextConfig
