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
        ],
      },
    ]
  },
}

export default nextConfig
