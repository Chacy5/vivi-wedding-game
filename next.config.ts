import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The starter is also built with Vinext; Netlify performs its own optimized
  // Next build. Existing client-side JSON responses are intentionally dynamic.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
