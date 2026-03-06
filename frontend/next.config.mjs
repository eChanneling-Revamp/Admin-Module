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
        source: '/payment/:path*',
        destination: 'https://dpdlab1.slt.lk:8645/payment/:path*',
      },
    ]
  },
}

export default nextConfig
