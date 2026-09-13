import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/content", "@repo/db"],
  experimental: {
    // Screenshots, avatars and CV PDFs go through server actions only as paths,
    // but keep room for form payloads with long Markdown.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
