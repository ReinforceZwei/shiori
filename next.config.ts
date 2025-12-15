import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    authInterrupts: true,
  }
};

export default nextConfig;
