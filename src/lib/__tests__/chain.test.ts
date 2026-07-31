import { describe, it, expect } from 'vitest'
import { validateAddress, decodeMemo, parseChainError } from '../chain'
import { ACTIVE_CHAIN, explorerTxUrl } from '../chains'

describe('Payslip Robinhood Chain Helpers', () => {
  describe('validateAddress', () => {
    it('should validate correct 0x addresses', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      expect(validateAddress(address).valid).toBe(true)
    })

    it('should validate lowercase addresses', () => {
      expect(validateAddress('0x742d35cc6634c0532925a3b844bc454e4438f44e').valid).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(validateAddress('ABC').valid).toBe(false)
      expect(validateAddress('').valid).toBe(false)
      // Stellar G-address, the format this app used before the migration
      expect(validateAddress('GCCX2LJQ6EQT33SATIITWBFSZIJIYDYJU33MCKHBAK3YG6UQ6JRUYABA').valid).toBe(false)
      // Right prefix, wrong length
      expect(validateAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f4').valid).toBe(false)
    })
  })

  describe('decodeMemo', () => {
    it('should round-trip a text memo written as calldata', () => {
      // hex for "Payroll APR-2026"
      expect(decodeMemo('0x506179726f6c6c204150522d32303236')).toBe('Payroll APR-2026')
    })

    it('should return undefined for empty calldata', () => {
      expect(decodeMemo('0x')).toBeUndefined()
      expect(decodeMemo(undefined)).toBeUndefined()
    })

    it('should return undefined for calldata that is not printable text', () => {
      // A real contract call, not a memo
      expect(
        decodeMemo('0xa9059cbb0000000000000000000000000000000000000000000000000000000000000001')
      ).toBeUndefined()
    })
  })

  describe('parseChainError', () => {
    it('should map a wallet rejection', () => {
      expect(parseChainError({ code: 4001, message: 'User rejected the request' }))
        .toBe('Transaction rejected in your wallet')
    })

    it('should map insufficient funds', () => {
      expect(parseChainError(new Error('insufficient funds for gas * price + value')))
        .toContain('Insufficient ETH balance')
    })

    it('should fall through to the raw message', () => {
      expect(parseChainError(new Error('something odd happened'))).toBe('something odd happened')
    })
  })

  describe('parseChainError wallet-signing failures', () => {
    // Wallets with thinner EVM support fail on transfers carrying calldata and
    // report only this. The message has to name the memo, or there is no way to
    // guess what to change.
    it('points at the memo when the wallet cannot sign', () => {
      const message = parseChainError(
        new Error('There was an error attempting to sign the transaction.')
      )
      expect(message).toMatch(/memo/i)
      expect(message).toMatch(/gas/i)
    })

    it('reads the reason out of a nested wallet error', () => {
      const message = parseChainError({
        message: 'RPC Error',
        details: 'insufficient funds for gas * price + value',
      })
      expect(message).toContain('Insufficient ETH balance')
    })
  })

  describe('chain config', () => {
    it('should target Robinhood Chain testnet by default', () => {
      expect(ACTIVE_CHAIN.id).toBe(46630)
      expect(ACTIVE_CHAIN.nativeCurrency.symbol).toBe('ETH')
    })

    it('should build explorer links on the active chain', () => {
      expect(explorerTxUrl('0xabc')).toBe('https://explorer.testnet.chain.robinhood.com/tx/0xabc')
    })
  })
})
