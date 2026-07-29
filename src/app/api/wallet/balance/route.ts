import { NextRequest, NextResponse } from 'next/server'
import { isAddress, getAddress, formatEther } from 'viem'
import { getPublicClient } from '@/lib/chain'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  if (!isAddress(address)) {
    return NextResponse.json({ error: 'Invalid EVM address' }, { status: 400 })
  }

  try {
    const wei = await getPublicClient().getBalance({ address: getAddress(address) })
    const balance = parseFloat(formatEther(wei))

    return NextResponse.json({
      address,
      balance,
      // On the EVM every address exists; "funded" only means it holds gas money.
      funded: balance > 0,
    })
  } catch (error: unknown) {
    console.error('Balance lookup failed:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
