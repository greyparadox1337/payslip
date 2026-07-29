'use client'

import React, { useState, useEffect } from 'react'
import { getNativeBalance } from '@/lib/chain'
import { Button } from '@/components/ui/button'
import { RefreshCw, Send, ExternalLink, Wallet } from 'lucide-react'
import SendPanel from './SendPanel'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { explorerAddressUrl } from '@/lib/chains'

export default function WalletStatusBar() {
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address')
    if (savedAddress) {
      setAddress(savedAddress)
      refresh()
    }
  }, [])

  const refresh = async () => {
    const savedAddress = localStorage.getItem('wallet_address')
    if (!savedAddress) return
    
    setIsRefreshing(true)
    const bal = await getNativeBalance(savedAddress)
    setBalance(bal)
    setTimeout(() => setIsRefreshing(false), 800)
  }

  if (!address) return null

  return (
    <div className="h-14 w-full border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Connected</span>
          <span className="text-[11px] font-mono text-muted-foreground opacity-60">
            {address.slice(0, 6)}...{address.slice(-6)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tighter text-primary">
                {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '---'}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">ETH</span>
              <button 
                onClick={refresh} 
                disabled={isRefreshing}
                className="p-1 hover:bg-primary/10 rounded-full transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className={`h-3 w-3 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <Badge variant="outline" className="h-4 text-[8px] font-black uppercase tracking-tighter p-0 text-muted-foreground border-none">
              Robinhood Chain Testnet
            </Badge>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-border/40 mx-2" />

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-white h-9 px-4 font-bold tracking-tight shadow-lg shadow-primary/20">
                <Send className="h-3.5 w-3.5 mr-2" />
                Send ETH
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 border-none bg-transparent shadow-none">
              <SendPanel />
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={() => window.open(explorerAddressUrl(address), '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
