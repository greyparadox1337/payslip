const required = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
}

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Add it to .env.local for development or Vercel dashboard for production.`
    )
  }
}

export const env = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
  CHAIN_ENV: process.env.NEXT_PUBLIC_CHAIN_ENV ?? 'testnet',
  BOTCHAIN_RPC:
    process.env.NEXT_PUBLIC_BOTCHAIN_RPC ?? 'https://rpc.testnet.chain.botchain.network',
}
