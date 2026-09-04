'use client'

import React, { useState, useEffect } from 'react'
import {
  isWalletInstalled,
  isOnBotChain,
  getNativeBalance
} from '@/lib/chain'
import { ACTIVE_CHAIN } from '@/lib/chains'
import { Card } from '@/components/ui/card'
import { Check, X, ChevronUp, Wallet, ShieldCheck, Globe, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Level1StatusBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState({
    installed: false,
    onChain: false,
    balanceLoaded: false,
    ready: false
  })

  useEffect(() => {
    const checkAll = async () => {
      try {
        const installed = await isWalletInstalled()
        const onChain = await isOnBotChain()
        const address = localStorage.getItem('wallet_address')
        const isBalanceLoaded = address ? (await getNativeBalance(address)) >= 0 : false
        const isReady = installed && onChain && isBalanceLoaded

        setStatus({
          installed,
          onChain,
          balanceLoaded: isBalanceLoaded,
          ready: isReady
        })
      } catch {
        // Fallback for any errors
      }
    }

    checkAll()
    const interval = setInterval(checkAll, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden shadow-2xl border bg-card/95 backdrop-blur-md",
          isOpen ? "w-64 rounded-2xl" : "w-16 h-10 rounded-full cursor-pointer hover:scale-105"
        )}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {!isOpen ? (
          <div className="flex h-full items-center justify-center gap-1.5 px-3">
            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">L1</span>
            {status.ready ? (
              <ShieldCheck className="h-4 w-4 text-cyan-500" />
            ) : (
              <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest">Level 1 Status</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              <StatusItem label="Wallet Installed" active={status.installed} />
              <StatusItem label={ACTIVE_CHAIN.name} active={status.onChain} />
              <StatusItem label="Balance Loaded" active={status.balanceLoaded} />
              <StatusItem label="Ready to Transact" active={status.ready} />
            </div>

            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Belt Progression</span>
                <span className="text-[10px] font-black text-primary">LEVEL 1 ✓</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${(Object.values(status).filter(Boolean).length / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {isOpen && (
        <div 
          className="fixed inset-0 -z-10 bg-transparent" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

function StatusItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-xs font-medium transition-colors", active ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      {active ? (
        <div className="h-4 w-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-cyan-500 stroke-[4px]" />
        </div>
      ) : (
        <div className="h-4 w-4 rounded-full bg-rose-500/10 flex items-center justify-center">
          <X className="h-2.5 w-2.5 text-rose-500 stroke-[4px]" />
        </div>
      )}
    </div>
  )
}
