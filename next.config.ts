import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "osbgaolfjprzlwkf.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    }
  }
  
};

export default nextConfig;
