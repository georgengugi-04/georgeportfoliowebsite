/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/skills", destination: "/engineering", permanent: true },
      { source: "/experience", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
