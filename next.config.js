/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['geodata.md.gov', 'maps.googleapis.com'],
  },
};

module.exports = nextConfig;
