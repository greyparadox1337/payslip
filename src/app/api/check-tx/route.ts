import { getPublicClient } from '@/lib/chain';
import { formatEther, type Hash } from 'viem';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const hash = url.searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Missing transaction hash parameter' }, { status: 400 });
  }

  try {
    const client = getPublicClient();
    const receipt = await client.getTransactionReceipt({ hash: hash as Hash });
    const block = await client.getBlock({ blockNumber: receipt.blockNumber });

    return NextResponse.json({
      status: 'success',
      successful: receipt.status === 'success',
      createdAt: new Date(Number(block.timestamp) * 1000).toISOString(),
      feeCharged: formatEther(receipt.gasUsed * receipt.effectiveGasPrice),
    });
  } catch (error: unknown) {
    // No receipt yet means the transaction is still in the mempool, not a failure
    const message = error instanceof Error ? error.message : String(error);
    if (/could not be found|not found|receipt/i.test(message)) {
      return NextResponse.json({ status: 'pending', successful: false });
    }

    console.error('check-tx failed:', error);
    return NextResponse.json({ error: 'Failed to verify transaction' }, { status: 500 });
  }
}
