import { NextRequest, NextResponse } from 'next/server'
import { getTransactionByHash } from '@/lib/chain'

export async function POST(req: NextRequest) {
  try {
    const { txHash } = await req.json()

    if (!txHash) {
      return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 })
    }

    // Verify transaction exists on Robinhood Chain
    const tx = await getTransactionByHash(txHash)

    if (!tx) {
      return NextResponse.json({ verified: false, error: 'Transaction not found' }, { status: 404 })
    }

    // Return verification and details for audit
    return NextResponse.json({
      verified: true,
      txDetails: {
        hash: tx.txHash,
        blockNumber: tx.blockNumber,
        createdAt: tx.createdAt,
        source: tx.sourceAccount,
        fee: tx.fee,
        memo: tx.memo,
        successful: tx.successful,
      },
    })
  } catch (error: unknown) {
    console.error('Verify transaction error:', error)
    return NextResponse.json({ verified: false, error: 'Failed to verify transaction' }, { status: 500 })
  }
}
