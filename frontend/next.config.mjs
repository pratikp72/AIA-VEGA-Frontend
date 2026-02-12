import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appNodeModules = path.join(__dirname, "node_modules");

/** @type {import('next').NextConfig} */
const nextConfig = {
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
