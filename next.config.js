// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  typescript: {
    // TODO: turn this off once we get things more stable
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
