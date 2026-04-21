import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
  basePath: "/achieve",
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/achieve",
        basePath: false,
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const apiProxyUrl = process.env.API_PROXY_URL || "http://127.0.0.1:5001/achieve";

    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
