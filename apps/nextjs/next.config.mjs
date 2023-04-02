// @ts-check

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  transpilePackages: ["@acme/authjs-adapter-drizzle", "@acme/trpc-next-layout"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI },
};

export default config;
