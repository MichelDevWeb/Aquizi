const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

// Next.js automatically loads the appropriate .env file based on NODE_ENV:
// - In development: .env.local
// - In production: .env.prod (if it exists)
// - In test: .env.test (if it exists)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Add environment variables to be available at build time
  env: {
    API_URL: process.env.API_URL,
    // Add other environment variables as needed
  },
};

module.exports = withPWA(nextConfig);
