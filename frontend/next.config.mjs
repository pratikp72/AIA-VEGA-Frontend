import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appNodeModules = path.join(__dirname, "node_modules");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      // Dev server (Strapi uploads)
      { protocol: 'http', hostname: '192.168.2.84', port: '', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '192.168.2.84', port: '1337', pathname: '/uploads/**' },
      // Localhost dev
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
    ],
  },
  turbopack: {
    // Resolve from this app's node_modules so tailwindcss etc. are found (fixes wrong root when C:\Users\DELL\package.json exists)
    resolveAlias: {
      tailwindcss: path.join(appNodeModules, "tailwindcss"),
      "tw-animate-css": path.join(appNodeModules, "tw-animate-css"),
    },
  },
  webpack: (config) => {
    config.resolve.modules = [
      appNodeModules,
      ...(config.resolve.modules || []),
    ];
    return config;
  },
};

export default nextConfig;
