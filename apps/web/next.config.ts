import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321");

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/content", "@repo/db"],
  images: {
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Local Supabase serves images from 127.0.0.1, which the optimizer blocks by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl(nextConfig);
