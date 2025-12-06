import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/FocusTheme',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
