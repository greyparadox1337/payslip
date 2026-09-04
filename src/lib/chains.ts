import { defineChain } from 'viem'

/**
 * BOT Chain Mainnet
 */
export const botChain = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOT Scan',
      url: 'https://scan.botchain.ai',
      apiUrl: 'https://scan.botchain.ai/api', // assuming this is the standard blockscout api path
    },
  },
})

/** The network this deployment targets. */
export const ACTIVE_CHAIN = botChain

export const RPC_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_RPC || ACTIVE_CHAIN.rpcUrls.default.http[0]

export const EXPLORER_URL = ACTIVE_CHAIN.blockExplorers.default.url
export const EXPLORER_API_URL = ACTIVE_CHAIN.blockExplorers.default.apiUrl

/** BOT Chain faucet — not needed for mainnet */
export const FAUCET_URL = ''

export const NATIVE_SYMBOL = ACTIVE_CHAIN.nativeCurrency.symbol

export function explorerAddressUrl(address: string) {
  return `${EXPLORER_URL}/address/${address}`
}

export function explorerTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`
}
