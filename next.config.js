/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  swcMinify: true,
  experimental: { images: { allowFutureImage: true, unoptimized: true } },
  images: {
    domains: ["cdn.jsdelivr.net"],
  },
};

module.exports = nextConfig;
