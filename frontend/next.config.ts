import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/achieve",
  output: "export",
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
