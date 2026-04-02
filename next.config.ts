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
    return [
      {
        source: "/dashboard",
        destination: "/jobs",
      },
      {
        source: "/dashboard/:path*",
        destination: "/:path*",
      },
    ]
  },

  /* Configure headers for security */
  async headers() {
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ]
  },
}

export default nextConfig
