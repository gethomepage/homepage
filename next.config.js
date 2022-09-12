/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  swcMinify: false,
  images: {
    domains: ["cdn.jsdelivr.net"],
    unoptimized: true,
  },
  experimental: { images: { allowFutureImage: true } }
};

module.exports = nextConfig;
