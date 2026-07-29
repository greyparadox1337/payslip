const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['explorer.testnet.chain.robinhood.com', 'robinhoodchain.blockscout.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.mongodb.net' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  env: {
    NEXT_PUBLIC_CHAIN_ENV: process.env.NEXT_PUBLIC_CHAIN_ENV,
    NEXT_PUBLIC_ROBINHOOD_RPC: process.env.NEXT_PUBLIC_ROBINHOOD_RPC,
  },
}
module.exports = nextConfig

