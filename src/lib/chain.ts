import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  parseEther,
  isAddress,
  getAddress,
  toHex,
  hexToString,
  numberToHex,
  BaseError,
  UserRejectedRequestError,
  type Address,
  type Hash,
  type EIP1193Provider,
} from 'viem'
import {
  ACTIVE_CHAIN,
  RPC_URL,
  EXPLORER_API_URL,
  NATIVE_SYMBOL,
} from './chains'

const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(RPC_URL),
})

export function getPublicClient() {
  return publicClient
}

export { NATIVE_SYMBOL }

// ── 1. WALLET SETUP ──────────────────────────────────────────

declare global {
  interface Window {
    ethereum?: EIP1193Provider
  }
}

function getProvider(): EIP1193Provider | null {
  if (typeof window === 'undefined') return null
  return window.ethereum ?? null
}

/**
 * Check if an EIP-1193 wallet (MetaMask, Rabby, ...) is injected in the browser
 */
export async function isWalletInstalled(): Promise<boolean> {
  return getProvider() !== null
}

/**
 * Check if the injected wallet has already authorised an account for this site.
 * Uses eth_accounts, which never prompts.
 */
export async function isWalletConnected(): Promise<boolean> {
  const provider = getProvider()
  if (!provider) return false
  try {
    const accounts = (await provider.request({ method: 'eth_accounts' })) as Address[]
    return accounts.length > 0
  } catch {
    return false
  }
}

/**
 * The already-authorised account, if any. Never prompts — returns null when the
 * site has not been connected yet.
 */
export async function getConnectedAddress(): Promise<Address | null> {
  const provider = getProvider()
  if (!provider) return null
  try {
    const accounts = (await provider.request({ method: 'eth_accounts' })) as Address[]
    return accounts.length ? getAddress(accounts[0]) : null
  } catch {
    return null
  }
}

/**
 * Get the chain the wallet is currently pointed at
 */
export async function getWalletChainId(): Promise<number | null> {
  const provider = getProvider()
  if (!provider) return null
  try {
    const hex = (await provider.request({ method: 'eth_chainId' })) as string
    return parseInt(hex, 16)
  } catch {
    return null
  }
}

/**
 * True when the wallet is on the chain this deployment targets
 */
export async function isOnRobinhoodChain(): Promise<boolean> {
  return (await getWalletChainId()) === ACTIVE_CHAIN.id
}

/**
 * Ask the wallet to switch to Robinhood Chain, adding the network first if it is unknown.
 */
export async function switchToRobinhoodChain(): Promise<void> {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet installed')

  const chainIdHex = numberToHex(ACTIVE_CHAIN.id)
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (error: unknown) {
    // 4902 = chain not added to the wallet yet
    const code = (error as { code?: number })?.code
    if (code !== 4902) throw error

    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: ACTIVE_CHAIN.name,
            nativeCurrency: ACTIVE_CHAIN.nativeCurrency,
            rpcUrls: [...ACTIVE_CHAIN.rpcUrls.default.http],
            blockExplorerUrls: [ACTIVE_CHAIN.blockExplorers.default.url],
          },
        ],
      } as Parameters<EIP1193Provider['request']>[0])
    } catch (addError: unknown) {
      // Not every wallet lets a site add a network. Phantom, for one, ships a
      // fixed network list and has no custom-RPC flow, so this is a dead end
      // rather than something the user can approve — say so instead of
      // bubbling up "method not supported".
      const addCode = (addError as { code?: number })?.code
      if (addCode === 4200 || addCode === -32601 || addCode === -32602) {
        throw new Error(
          `${getWalletName()} will not let a website add a network. ` +
            `Add ${ACTIVE_CHAIN.name} manually in your wallet (chain ID ${ACTIVE_CHAIN.id}, ` +
            `RPC ${ACTIVE_CHAIN.rpcUrls.default.http[0]}), or use MetaMask or Rabby.`
        )
      }
      throw addError
    }
  }
}

/** Best-effort wallet name, for error messages that need to be specific. */
export function getWalletName(): string {
  const provider = getProvider() as
    | (EIP1193Provider & { isPhantom?: boolean; isMetaMask?: boolean; isRabby?: boolean })
    | null
  if (!provider) return 'Your wallet'
  if (provider.isPhantom) return 'Phantom'
  if (provider.isRabby) return 'Rabby'
  if (provider.isMetaMask) return 'MetaMask'
  return 'Your wallet'
}

function getWalletClient(account: Address) {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet installed')
  return createWalletClient({
    account,
    chain: ACTIVE_CHAIN,
    transport: custom(provider),
  })
}

// ── 2. WALLET CONNECT / DISCONNECT ───────────────────────────

/**
 * Prompt the wallet for account access and make sure it is on Robinhood Chain.
 */
export async function connectInjectedWallet(): Promise<{
  address: Address
  chainId: number
}> {
  const provider = getProvider()
  if (!provider) {
    throw new Error('No wallet installed')
  }

  try {
    const accounts = (await provider.request({
      method: 'eth_requestAccounts',
    })) as Address[]

    if (!accounts.length) {
      throw new Error('No accounts returned by wallet')
    }
    const address = getAddress(accounts[0])

    if (!(await isOnRobinhoodChain())) {
      await switchToRobinhoodChain()
    }

    const chainId = (await getWalletChainId()) ?? ACTIVE_CHAIN.id
    if (chainId !== ACTIVE_CHAIN.id) {
      throw new Error(`Please switch your wallet to ${ACTIVE_CHAIN.name}`)
    }

    return { address, chainId }
  } catch (error: unknown) {
    throw new Error(parseChainError(error))
  }
}

/**
 * Disconnect wallet (clears local state)
 *
 * EIP-1193 wallets have no programmatic disconnect, so we just return success
 * and handle state clearing in the UI components.
 */
export function disconnectWallet(): { success: boolean } {
  return { success: true }
}

/**
 * Subscribe to wallet account/chain changes. Returns an unsubscribe function.
 */
export function onWalletChange(handlers: {
  onAccountsChanged?: (accounts: string[]) => void
  onChainChanged?: (chainId: number) => void
}): () => void {
  const provider = getProvider()
  if (!provider) return () => {}

  const accountsHandler = (accounts: unknown) =>
    handlers.onAccountsChanged?.(accounts as string[])
  const chainHandler = (chainId: unknown) =>
    handlers.onChainChanged?.(parseInt(chainId as string, 16))

  provider.on('accountsChanged', accountsHandler)
  provider.on('chainChanged', chainHandler)

  return () => {
    provider.removeListener('accountsChanged', accountsHandler)
    provider.removeListener('chainChanged', chainHandler)
  }
}

// ── 3. BALANCE HANDLING ───────────────────────────────────────

/**
 * Fetch native ETH balance for a wallet address from Robinhood Chain
 */
export async function getNativeBalance(address: string): Promise<number> {
  if (!isAddress(address)) return 0
  try {
    const wei = await publicClient.getBalance({ address: getAddress(address) })
    return parseFloat(formatEther(wei))
  } catch {
    return 0
  }
}

// ── 4. TRANSACTION FLOW ───────────────────────────────────────

export type SendResult =
  | {
      success: true
      txHash: string
      blockNumber: number
      timestamp: string
      amount: string
      destination: string
      fee: string
    }
  | {
      success: false
      error: string
      code?: string
    }

/**
 * Send native ETH from the connected wallet to a destination.
 *
 * The optional memo rides along as transaction calldata, which is the closest
 * EVM analogue to a Stellar memo: it is permanently recorded with the transfer
 * and readable from the explorer. It does add gas proportional to its length.
 *
 * WALLET COMPATIBILITY: a value transfer carrying calldata is valid — the chain
 * prices and accepts it — but wallets classify it as a contract interaction and
 * run extra simulation on it. Wallets with newer or thinner EVM support (Phantom
 * among them) can fail to sign these while signing plain transfers fine, and the
 * failure surfaces as a generic "error attempting to sign". Leave the memo empty
 * for maximum compatibility; callers must treat it as opt-in, not a default.
 */
export async function sendNative(params: {
  sourceAddress: string
  destinationAddress: string
  amountEth: string
  memo?: string
  /** Fires once the wallet has signed and broadcast, before the receipt lands. */
  onSubmitted?: (txHash: Hash) => void
}): Promise<SendResult> {
  try {
    if (!isAddress(params.sourceAddress)) {
      throw new Error('Invalid source address')
    }
    if (!isAddress(params.destinationAddress)) {
      throw new Error('Invalid destination address')
    }

    const account = getAddress(params.sourceAddress)
    const walletClient = getWalletClient(account)

    const txHash = await walletClient.sendTransaction({
      account,
      chain: ACTIVE_CHAIN,
      to: getAddress(params.destinationAddress),
      value: parseEther(params.amountEth),
      ...(params.memo ? { data: toHex(params.memo) } : {}),
    })

    params.onSubmitted?.(txHash)

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

    if (receipt.status === 'reverted') {
      return { success: false, error: 'Transaction reverted on chain', code: 'reverted' }
    }

    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })

    return {
      success: true,
      txHash,
      blockNumber: Number(receipt.blockNumber),
      timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
      amount: params.amountEth,
      destination: params.destinationAddress,
      fee: formatEther(receipt.gasUsed * receipt.effectiveGasPrice),
    }
  } catch (error: unknown) {
    // Wallets report signing failures with a generic string in the UI while the
    // actionable part sits in these fields. Log all of them — without this there
    // is nothing to go on when a send fails on someone else's machine.
    const e = error as {
      code?: unknown
      details?: unknown
      shortMessage?: unknown
      cause?: { code?: unknown; message?: unknown }
    }
    console.error('sendNative failure', {
      message: error instanceof Error ? error.message : String(error),
      code: e?.code,
      details: e?.details,
      shortMessage: e?.shortMessage,
      causeCode: e?.cause?.code,
      causeMessage: e?.cause?.message,
      chainId: ACTIVE_CHAIN.id,
      request: {
        from: params.sourceAddress,
        to: params.destinationAddress,
        value: params.amountEth,
        hasMemo: Boolean(params.memo),
      },
    })

    return {
      success: false,
      error: parseChainError(error),
      code: String(e?.code ?? (error instanceof BaseError ? error.name : 'error')),
    }
  }
}

/**
 * Fallback gas for one native transfer when the node cannot be asked.
 *
 * Not 21000: Robinhood Chain is an Arbitrum Orbit L2 and charges for posting
 * the transaction to L1 on top of L2 execution, so a bare transfer measures
 * ~28200 here. Quoting 21000 understates every fee on this chain.
 */
const FALLBACK_TRANSFER_GAS = BigInt(35000)

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

/**
 * Estimated gas cost, in ETH, of one native transfer carrying `memo` as calldata.
 * Unlike Stellar's flat 100-stroop fee, EVM cost moves with gas price, payload
 * size, and L1 posting costs, so ask the node rather than compute it.
 */
export async function estimateTransferFee(memo?: string): Promise<number> {
  try {
    const gasPrice = await publicClient.getGasPrice()
    const gas = await estimateTransferGas(memo)
    return parseFloat(formatEther(gas * gasPrice))
  } catch {
    return 0
  }
}

/** Gas units for one native transfer, measured against the node. */
async function estimateTransferGas(memo?: string): Promise<bigint> {
  const probe = (await getConnectedAddress()) ?? ZERO_ADDRESS
  try {
    // Zero-value self-send: same shape as a real payment, so the node prices
    // the L1 posting component too, without needing a funded balance.
    return await publicClient.estimateGas({
      account: probe,
      to: probe,
      value: BigInt(0),
      ...(memo ? { data: toHex(memo) } : {}),
    })
  } catch {
    return FALLBACK_TRANSFER_GAS
  }
}

/**
 * Validate an EVM address
 */
export function validateAddress(address: string): {
  valid: boolean
  error?: string
} {
  if (!isAddress(address)) {
    return { valid: false, error: 'Invalid address — expected a 0x… EVM address' }
  }
  return { valid: true }
}

// ── App-facing helpers (UI expects these names) ────────────────

export async function checkWalletConnection(): Promise<boolean> {
  return await isWalletConnected()
}

export async function connectWallet(): Promise<string> {
  const { address } = await connectInjectedWallet()
  return address || ''
}

export async function getWalletBalance(address: string): Promise<string> {
  const bal = await getNativeBalance(address)
  return bal.toFixed(4)
}

export type PaymentRecord = {
  id: string
  transactionHash: string
  amount: string
  createdAt: string
  to?: string
}

/**
 * Incoming native transfers for an address.
 *
 * Native ETH transfers emit no logs, so they cannot be pulled from eth_getLogs.
 * We read them from the chain's Blockscout indexer instead.
 */
export async function getTransactionHistory(address: string): Promise<PaymentRecord[]> {
  if (!isAddress(address)) return []

  try {
    const res = await fetch(
      `${EXPLORER_API_URL}/v2/addresses/${getAddress(address)}/transactions?filter=to`,
      { headers: { accept: 'application/json' } }
    )
    if (!res.ok) return []

    const data = await res.json()
    const items: any[] = Array.isArray(data?.items) ? data.items : []

    const records: PaymentRecord[] = []

    for (const tx of items.slice(0, 20)) {
      if (tx.status && tx.status !== 'ok') continue
      if (typeof tx.hash !== 'string') continue
      if (typeof tx.value !== 'string') continue
      if (typeof tx.timestamp !== 'string') continue

      const to = tx.to?.hash
      if (typeof to !== 'string') continue
      if (getAddress(to) !== getAddress(address)) continue

      // Skip zero-value calls — this list is a payment history
      let amount: string
      try {
        if (BigInt(tx.value) === BigInt(0)) continue
        amount = formatEther(BigInt(tx.value))
      } catch {
        continue
      }

      records.push({
        id: tx.hash,
        transactionHash: tx.hash,
        amount,
        createdAt: tx.timestamp,
        to,
      })
    }

    return records
  } catch {
    return []
  }
}

export type BulkDisburseResult = {
  success: boolean
  txHash?: string
  error?: string
  employeeName?: string
  destination?: string
}

/**
 * Disburse ETH to multiple employees.
 *
 * Stellar packed every payment into one multi-operation transaction. The EVM has
 * no native equivalent for plain transfers, so this sends one transaction per
 * employee and the wallet prompts once per employee. Each entry succeeds or
 * fails independently — a failure does not roll back earlier payments, so the
 * caller must surface the per-entry results rather than a single status.
 */
export async function bulkDisburse(
  entries: { destination: string; amount: string; employeeName: string }[],
  currency: string = NATIVE_SYMBOL,
  // Off by default: a memo rides as calldata, and not every wallet can sign a
  // value transfer that carries data. See sendNative.
  options: { includeMemo?: boolean } = {}
): Promise<BulkDisburseResult[]> {
  const results: BulkDisburseResult[] = []

  let sourceAddress: string
  try {
    const { address } = await connectInjectedWallet()
    sourceAddress = address
  } catch (error: unknown) {
    return entries.map((entry) => ({
      success: false,
      error: parseChainError(error),
      employeeName: entry.employeeName,
      destination: entry.destination,
    }))
  }

  for (const entry of entries) {
    const result = await sendNative({
      sourceAddress,
      destinationAddress: entry.destination,
      amountEth: entry.amount,
      ...(options.includeMemo
        ? { memo: `Payroll ${currency} - ${entry.employeeName}` }
        : {}),
    })

    results.push(
      result.success
        ? {
            success: true,
            txHash: result.txHash,
            employeeName: entry.employeeName,
            destination: entry.destination,
          }
        : {
            success: false,
            error: result.error,
            employeeName: entry.employeeName,
            destination: entry.destination,
          }
    )
  }

  return results
}

/**
 * Get transaction details from the chain by txHash
 */
export async function getTransactionByHash(txHash: string): Promise<{
  txHash: string
  blockNumber: number
  createdAt: string
  sourceAccount: string
  fee: string
  memo?: string
  successful: boolean
} | null> {
  try {
    const hash = txHash as Hash
    const [tx, receipt] = await Promise.all([
      publicClient.getTransaction({ hash }),
      publicClient.getTransactionReceipt({ hash }),
    ])
    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })

    return {
      txHash: tx.hash,
      blockNumber: Number(receipt.blockNumber),
      createdAt: new Date(Number(block.timestamp) * 1000).toISOString(),
      sourceAccount: tx.from,
      fee: formatEther(receipt.gasUsed * receipt.effectiveGasPrice),
      memo: decodeMemo(tx.input),
      successful: receipt.status === 'success',
    }
  } catch {
    return null
  }
}

/**
 * Read back a memo written as calldata by sendNative. Returns undefined for
 * calldata that is not valid UTF-8 (i.e. a real contract call, not a memo).
 */
export function decodeMemo(input?: string): string | undefined {
  if (!input || input === '0x') return undefined
  try {
    const decoded = hexToString(input as `0x${string}`)
    // eslint-disable-next-line no-control-regex
    return /^[\x09\x0A\x0D\x20-\x7E]*$/.test(decoded) ? decoded : undefined
  } catch {
    return undefined
  }
}

/**
 * Convert chain/wallet errors into human-readable messages
 */
export function parseChainError(error: unknown): string {
  if (error instanceof UserRejectedRequestError) {
    return 'Transaction rejected in your wallet'
  }

  // Wallets bury the useful sentence in `details` / `cause`; the top-level
  // message is often just "There was an error attempting to sign".
  const nested = error as { details?: string; shortMessage?: string; cause?: { message?: string } }
  const raw = [
    error instanceof Error ? error.message : String(error),
    nested?.details,
    nested?.shortMessage,
    nested?.cause?.message,
  ]
    .filter(Boolean)
    .join(' | ')

  const code = (error as { code?: number })?.code

  if (code === 4001 || /user rejected|user denied/i.test(raw)) {
    return 'Transaction rejected in your wallet'
  }
  if (code === 4902) {
    return `${ACTIVE_CHAIN.name} is not added to your wallet yet`
  }

  const patterns: [RegExp, string][] = [
    [/insufficient funds/i, `Insufficient ${NATIVE_SYMBOL} balance to cover the amount plus gas`],
    [/nonce too low|nonce has already been used/i, 'Transaction nonce error. Please try again.'],
    [/replacement transaction underpriced/i, 'A transaction is already pending. Wait for it to confirm.'],
    [/intrinsic gas too low|gas required exceeds/i, 'Gas limit too low. Please try again.'],
    [/max fee per gas less than block base fee|underpriced/i, 'Gas price too low. Please try again.'],
    [/chain(-| )?id|chain mismatch|does not match/i, `Wrong network — switch your wallet to ${ACTIVE_CHAIN.name}`],
    [/execution reverted/i, 'Transaction reverted on chain'],
    [/no wallet installed/i, 'No wallet detected. Install MetaMask to continue.'],
  ]

  // The wallet's catch-all when it cannot build the transaction. Two causes
  // dominate: nothing left over for gas, or a memo the wallet won't sign.
  if (/error attempting to sign|failed to sign|unable to sign/i.test(raw)) {
    return (
      `${getWalletName()} could not sign this transaction. ` +
      `Clear the memo field (some wallets refuse transfers carrying one) and leave ` +
      `some ${NATIVE_SYMBOL} unspent for gas, then retry.`
    )
  }

  for (const [pattern, message] of patterns) {
    if (pattern.test(raw)) return message
  }

  if (error instanceof BaseError) {
    return error.shortMessage || raw
  }

  return raw || 'An unexpected chain error occurred'
}
