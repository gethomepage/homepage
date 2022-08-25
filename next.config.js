/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  swcMinify: false,
  experimental: { images: { allowFutureImage: true, unoptimized: true } },
  images: {
    domains: ["cdn.jsdelivr.net"],
  },
};

module.exports = nextConfig;
