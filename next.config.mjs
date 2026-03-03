/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow streaming responses from API routes
  experimental: {
    // Enable if you need server actions (we might use them)
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

export default nextConfig
