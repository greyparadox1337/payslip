import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchETHPrice } from '../price'

describe('Payslip Price Utils', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
    })
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should return fallback price when API fails and no cache exists', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
    const price = await fetchETHPrice()
    expect(price).toBe(3000) // Fallback ETH price
  })

  it('should return cached price if valid', async () => {
    const cachedData = JSON.stringify({
      price: 3125.5,
      timestamp: Date.now() - 1000 // 1 second ago
    })
    vi.mocked(localStorage.getItem).mockReturnValue(cachedData)
    
    const price = await fetchETHPrice()
    expect(price).toBe(3125.5)
    expect(fetch).not.toHaveBeenCalled()
  })
})
