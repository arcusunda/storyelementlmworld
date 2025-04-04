/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: { externals: string[]; }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storyelement.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;