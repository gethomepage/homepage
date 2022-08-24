/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  swcMinify: true,
  images: {
    domains: ["cdn.jsdelivr.net"],
  },
};

module.exports = nextConfig;
