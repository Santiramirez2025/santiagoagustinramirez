import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/drei"],
  },
};

export default withNextIntl(nextConfig);
