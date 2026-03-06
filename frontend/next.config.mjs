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
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'https://admin-module-backend-igfcb5tmy-tharindu-ariyawanshas-projects.vercel.app/api/:path*',
      },
    ]
  },
}

export default nextConfig
