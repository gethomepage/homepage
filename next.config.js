const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: ["cdn.jsdelivr.net"],
  },
  i18n,
};

module.exports = nextConfig;
