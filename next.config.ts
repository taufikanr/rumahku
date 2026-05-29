import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app so a stray lockfile elsewhere
  // (e.g. ~/pnpm-lock.yaml) doesn't get picked as the root.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
