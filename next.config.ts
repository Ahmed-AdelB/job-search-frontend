import type { NextConfig } from "next"

/**
 * Next.js Configuration
 * Author: Ahmed Adel Bakr Alderai
 */
const nextConfig: NextConfig = {
  /* Docker support */
  output: "standalone",

  /* Optimize images */
  images: {
    formats: ["image/avif", "image/webp"],
  },

  /* Redirect trailing slashes */
  trailingSlash: false,

  /* Rewrite /dashboard/* to /* since (dashboard) route group doesn't create URL segments */
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082"
    return [
      {
        source: "/dashboard",
        destination: "/jobs",
      },
      {
        source: "/dashboard/:path*",
        destination: "/:path*",
      },
      /* Proxy /api/* to backend — browser sends relative URLs */
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },

  /* Configure headers for security */
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082"
    // Extract the origin from API URL for CSP
    const apiOrigin = new URL(apiUrl).origin

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ${apiOrigin} ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`,
          },
        ],
      },
    ]
  },
}

export default nextConfig
