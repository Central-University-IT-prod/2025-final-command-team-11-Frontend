import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/app/config/env");

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },

      {
        hostname: "api.qrserver.com",
      },
    ],
  },

  outputFileTracingRoot: path.join(__dirname, "../../"),
  output: "standalone",

  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/api", "@acme/ui", "@acme/validators"],

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/api/v1/id/:path*",
      },
    ];
  },

  experimental: {
    reactCompiler: true,
  },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
