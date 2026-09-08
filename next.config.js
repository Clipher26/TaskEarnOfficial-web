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
        destination: `${process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8002"}/api/v1/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
