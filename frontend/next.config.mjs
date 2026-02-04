import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env files
const result1 = config({ path: join(__dirname, '.env.local') })
const result2 = config({ path: join(__dirname, '.env') })
console.log('Dotenv results:', { result1, result2 })

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    console.log('Environment variables loaded:', Object.keys(process.env).filter(k => k.includes('API')))
    console.log('NEXT_PUBLIC_API_URL value:', apiUrl)
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set. Please create a .env file with NEXT_PUBLIC_API_URL=https://your-backend-url.com')
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
