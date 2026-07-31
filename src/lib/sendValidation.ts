import { validateAddress } from './chain'

export interface SendFormState {
  destination: string
  amount: string
  /** Native balance of the sending wallet, in ETH. */
  balance: number
  /** False until the balance fetch has resolved. */
  balanceLoaded: boolean
  /** Estimated gas for one transfer, in ETH. */
  gasFee: number
}

export interface SendValidation {
  destinationError: string | null
  amountError: string | null
  /** Balance minus gas headroom — the most that can actually be sent. */
  spendable: number
  /** `spendable` rounded down to 6dp, safe to put straight into the input. */
  maxAmount: number
  canSend: boolean
}

/**
 * Gas headroom to hold back when the fee cannot be quoted.
 *
 * estimateTransferFee returns 0 both for "gas is nearly free" and for "the RPC
 * call failed". Trusting a 0 makes MAX offer the entire balance, and a transfer
 * with nothing left for gas cannot be signed at all — the wallet rejects it with
 * an opaque error. At Robinhood Chain's 0.01 gwei this is ~5000x a single
 * transfer, and still a rounding error in ETH terms.
 */
const FALLBACK_GAS_RESERVE = 0.000001

/**
 * L2 gas rounds to 0.000000 at six decimals, which reads as "free" rather than
 * "very small". Show a floor marker instead of a row of zeros.
 */
export function formatGas(fee: number): string {
  if (fee === 0) return '0'
  if (fee < 0.000001) return '<0.000001'
  return fee.toFixed(6)
}

/**
 * Validate the send form from its current values.
 *
 * Deliberately pure and recomputed per render rather than stored in state. When
 * these errors lived in a `useState` that only ran on blur and on submit, an
 * error raised before the balance loaded never cleared — and because the Send
 * button was disabled while an error was present, submitting (the only other
 * thing that recomputed them) was impossible. The form wedged with a stale
 * "Enter a valid amount" and no way out.
 */
export function deriveSendValidation(
  state: SendFormState,
  nativeSymbol = 'ETH'
): SendValidation {
  const { destination, amount, balance, balanceLoaded, gasFee } = state

  // Reserve two transfers' worth of gas so a MAX send still has room if the
  // gas price ticks up between the quote and the signature. Never reserve
  // nothing: a send that leaves zero for gas is unsignable.
  const gasReserve = Math.max(gasFee * 2, FALLBACK_GAS_RESERVE)
  const spendable = Math.max(0, balance - gasReserve)
  // Round DOWN: toFixed rounds up, which would put MAX a hair over spendable
  // and make the form reject its own suggestion.
  const maxAmount = Math.floor(spendable * 1e6) / 1e6

  // An empty field is incomplete, not wrong — don't shout at someone who has
  // not typed yet.
  const destinationError = !destination
    ? null
    : (validateAddress(destination).error ?? null)

  const numAmount = parseFloat(amount)
  let amountError: string | null = null
  if (amount) {
    if (isNaN(numAmount) || numAmount <= 0) {
      amountError = 'Enter a valid amount'
    } else if (balanceLoaded && numAmount > spendable) {
      // Only judge against a balance we have actually fetched
      amountError = `Insufficient balance (leave ~${formatGas(gasReserve)} ${nativeSymbol} for gas)`
    }
  }

  const canSend = Boolean(destination && amount && !destinationError && !amountError)

  return { destinationError, amountError, spendable, maxAmount, canSend }
}
