import { describe, it, expect } from 'vitest'
import { deriveSendValidation, formatGas, type SendFormState } from '../sendValidation'

const VALID_ADDRESS = '0x46291840D28ECba30f72f6ea8D4A28dE447640bD'

function form(overrides: Partial<SendFormState> = {}): SendFormState {
  return {
    destination: VALID_ADDRESS,
    amount: '0.005',
    balance: 0.01,
    balanceLoaded: true,
    gasFee: 0,
    ...overrides,
  }
}

describe('deriveSendValidation', () => {
  it('accepts a well-formed transfer', () => {
    const v = deriveSendValidation(form())
    expect(v.destinationError).toBeNull()
    expect(v.amountError).toBeNull()
    expect(v.canSend).toBe(true)
  })

  it('does not flag empty fields as wrong', () => {
    const v = deriveSendValidation(form({ destination: '', amount: '' }))
    expect(v.destinationError).toBeNull()
    expect(v.amountError).toBeNull()
    expect(v.canSend).toBe(false)
  })

  it('rejects a zero or negative amount', () => {
    expect(deriveSendValidation(form({ amount: '0' })).amountError).toBe('Enter a valid amount')
    expect(deriveSendValidation(form({ amount: '-1' })).amountError).toBe('Enter a valid amount')
    expect(deriveSendValidation(form({ amount: 'abc' })).amountError).toBe('Enter a valid amount')
  })

  it('rejects a non-EVM destination', () => {
    expect(deriveSendValidation(form({ destination: 'GCCX2LJQ' })).canSend).toBe(false)
  })

  // The reported bug: MAX filled the input with a value the form then rejected.
  it('accepts its own MAX suggestion', () => {
    const state = form({ balance: 0.01, gasFee: 0.0000004 })
    const { maxAmount } = deriveSendValidation(state)

    const afterMax = deriveSendValidation({ ...state, amount: maxAmount.toFixed(6) })
    expect(afterMax.amountError).toBeNull()
    expect(afterMax.canSend).toBe(true)
  })

  it('accepts its own MAX suggestion when gas is unquotable', () => {
    const state = form({ balance: 0.01, gasFee: 0 })
    const { maxAmount } = deriveSendValidation(state)
    expect(maxAmount).toBe(0.01)

    const afterMax = deriveSendValidation({ ...state, amount: maxAmount.toFixed(6) })
    expect(afterMax.canSend).toBe(true)
  })

  // The wedge: an error raised before the balance arrived used to stick forever.
  it('does not judge the amount before the balance has loaded', () => {
    const pending = deriveSendValidation(form({ balance: 0, balanceLoaded: false, amount: '0.01' }))
    expect(pending.amountError).toBeNull()
    expect(pending.canSend).toBe(true)
  })

  it('clears the error once a loaded balance covers the amount', () => {
    const broke = deriveSendValidation(form({ balance: 0, amount: '0.01' }))
    expect(broke.amountError).toContain('Insufficient balance')
    expect(broke.canSend).toBe(false)

    // Same amount, balance now funded — recomputing must let it through
    const funded = deriveSendValidation(form({ balance: 0.01, amount: '0.01' }))
    expect(funded.amountError).toBeNull()
    expect(funded.canSend).toBe(true)
  })

  it('reserves gas headroom out of the spendable balance', () => {
    const v = deriveSendValidation(form({ balance: 1, gasFee: 0.001 }))
    expect(v.spendable).toBeCloseTo(0.998, 10)
    expect(deriveSendValidation(form({ balance: 1, gasFee: 0.001, amount: '1' })).canSend).toBe(false)
  })
})

describe('formatGas', () => {
  it('marks a sub-microether fee as a floor rather than zero', () => {
    expect(formatGas(0.0000004)).toBe('<0.000001')
  })

  it('prints an exact zero plainly', () => {
    expect(formatGas(0)).toBe('0')
  })

  it('prints a normal fee at six decimals', () => {
    expect(formatGas(0.00025)).toBe('0.000250')
  })
})
