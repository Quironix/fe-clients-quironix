import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: "build",
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
