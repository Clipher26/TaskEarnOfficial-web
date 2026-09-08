/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      {
        source: "/api/v1/admin/:path*",
        destination: `${process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"}/api/v1/admin/:path*`,
      },
      {
        source: "/api/v1/social/:path*",
        destination: `${process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"}/api/v1/social/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
