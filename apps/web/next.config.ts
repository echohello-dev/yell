import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Clickjacking protection
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // XSS protection (legacy)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "font-src 'self'; " +
              "connect-src 'self' ws: wss:; " +
              "frame-ancestors 'none'; " +
              "form-action 'self'; " +
              "base-uri 'self'",
          },
          // Strict Transport Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value:
              'geolocation=(), ' +
              'microphone=(), ' +
              'camera=(), ' +
              'payment=(), ' +
              'usb=(), ' +
              'magnetometer=(), ' +
              'gyroscope=(), ' +
              'accelerometer=()',
          },
          // Cross-Origin policies
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS in production
  redirects: async () => {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path*',
          destination: 'https://:host/:path*',
          permanent: true,
          basePath: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
