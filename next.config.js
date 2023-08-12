/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    TAX_RATE: process.env.NEXT_PUBLIC_TAX_RATE,
  },
}

module.exports = nextConfig;
