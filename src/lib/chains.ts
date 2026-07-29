import { defineChain } from 'viem'

/**
 * Robinhood Chain — an Arbitrum Orbit L2 settling to Ethereum.
 * Gas is paid in ETH (18 decimals), same as L1.
 */
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.chain.robinhood.com'],
      webSocket: ['wss://feed.testnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.testnet.chain.robinhood.com',
      apiUrl: 'https://explorer.testnet.chain.robinhood.com/api',
    },
  },
  testnet: true,
})

export const robinhoodMainnet = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
      webSocket: ['wss://feed.mainnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
      apiUrl: 'https://robinhoodchain.blockscout.com/api',
    },
  },
})

/** The network this deployment targets. Testnet unless explicitly set to mainnet. */
export const ACTIVE_CHAIN =
  process.env.NEXT_PUBLIC_CHAIN_ENV === 'mainnet' ? robinhoodMainnet : robinhoodTestnet

export const RPC_URL =
  process.env.NEXT_PUBLIC_ROBINHOOD_RPC || ACTIVE_CHAIN.rpcUrls.default.http[0]

export const EXPLORER_URL = ACTIVE_CHAIN.blockExplorers.default.url
export const EXPLORER_API_URL = ACTIVE_CHAIN.blockExplorers.default.apiUrl

/** Robinhood Chain testnet faucet — a hosted page, there is no programmatic drip endpoint. */
export const FAUCET_URL = 'https://faucet.testnet.chain.robinhood.com'

export const NATIVE_SYMBOL = ACTIVE_CHAIN.nativeCurrency.symbol

export function explorerAddressUrl(address: string) {
  return `${EXPLORER_URL}/address/${address}`
}

export function explorerTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`
}
