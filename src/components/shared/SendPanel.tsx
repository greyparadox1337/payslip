'use client'

import React, { useState, useEffect } from 'react'
import {
  validateAddress,
  sendNative,
  getNativeBalance,
  estimateTransferFee,
  NATIVE_SYMBOL,
  SendResult
} from '@/lib/chain'
import { ACTIVE_CHAIN, explorerTxUrl } from '@/lib/chains'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Loader2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Clipboard,
  Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import confetti from 'canvas-confetti'

interface SendPanelProps {
  defaultMemo?: string
  onSuccess?: (result: SendResult) => void
  compact?: boolean
}

export default function SendPanel({ defaultMemo = '', onSuccess, compact = false }: SendPanelProps) {
  const [step, setStep] = useState<'FORM' | 'BUILDING' | 'SIGNING' | 'BROADCASTING' | 'SUCCESS' | 'FAILURE'>('FORM')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState(defaultMemo)
  const [balance, setBalance] = useState<number>(0)
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState<{ destination?: string; amount?: string }>({})
  const [txResult, setTxResult] = useState<SendResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [gasFee, setGasFee] = useState(0)

  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address')
    if (savedAddress) {
      setAddress(savedAddress)
      getNativeBalance(savedAddress).then(setBalance)
    }
  }, [])

  // Gas price moves, so re-quote the fee as the memo (calldata) changes
  useEffect(() => {
    estimateTransferFee(memo).then(setGasFee)
  }, [memo])

  // Leave headroom for gas so a MAX send does not fail on the fee
  const spendable = Math.max(0, balance - gasFee * 2)

  const validate = () => {
    const newErrors: { destination?: string; amount?: string } = {}

    const { valid, error } = validateAddress(destination)
    if (!valid) newErrors.destination = error ?? 'Invalid address'

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount'
    } else if (numAmount > spendable) {
      newErrors.amount = `Insufficient balance (leave ~${(gasFee * 2).toFixed(6)} ${NATIVE_SYMBOL} for gas)`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSend = async () => {
    if (!validate()) return

    setStep('BUILDING')
    setTimeout(async () => {
      setStep('SIGNING')
      try {
        const result = await sendNative({
          sourceAddress: address,
          destinationAddress: destination,
          amountEth: amount,
          memo: memo,
          onSubmitted: () => setStep('BROADCASTING')
        })

        if (result.success) {
          setTxResult(result)
          setStep('SUCCESS')
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a78bfa', '#22d3ee']
          })
          
          // Refresh balance
          const newBal = await getNativeBalance(address)
          setBalance(newBal)
          
          if (onSuccess) onSuccess(result)
        } else {
          setTxResult(result)
          setStep('FAILURE')
        }
      } catch (err: any) {
        setTxResult({ success: false, error: err.message })
        setStep('FAILURE')
      }
    }, 500)
  }

  const resetForm = () => {
    setStep('FORM')
    setAmount('')
    setDestination('')
    setMemo(defaultMemo)
    setTxResult(null)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setDestination(text)
    } catch {}
  }

  if (step === 'BUILDING' || step === 'SIGNING' || step === 'BROADCASTING') {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold">
              {step === 'BUILDING' && 'Building transaction...'}
              {step === 'SIGNING' && 'Waiting for wallet signature...'}
              {step === 'BROADCASTING' && `Broadcasting to ${ACTIVE_CHAIN.name}...`}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {step === 'BUILDING' && `Preparing your ${NATIVE_SYMBOL} payment details.`}
              {step === 'SIGNING' && 'Please approve the transaction in your wallet.'}
              {step === 'BROADCASTING' && 'Robinhood Chain blocks land in about 100ms.'}
            </p>
          </div>
          <div className="w-full max-w-xs rounded-lg bg-muted p-4 space-y-3">
             <div className="flex justify-between text-xs">
               <span className="text-muted-foreground">Sending</span>
               <span className="font-mono font-bold">{amount} {NATIVE_SYMBOL}</span>
             </div>
             <div className="flex justify-between text-xs">
               <span className="text-muted-foreground">To</span>
               <span className="font-mono">{destination.slice(0, 5)}...{destination.slice(-5)}</span>
             </div>
             {memo && (
               <div className="flex justify-between text-xs">
                 <span className="text-muted-foreground">Memo</span>
                 <span className="font-mono">{memo}</span>
               </div>
             )}
          </div>
          {step === 'SIGNING' && (
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-muted-foreground hover:text-rose-500">
              Cancel Transaction
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (step === 'SUCCESS' && txResult?.success) {
    return (
      <Card className="border-cyan-500/20 bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-cyan-500/5 px-6 py-4 flex items-center justify-center border-b border-cyan-500/10">
          <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
             <CheckCircle2 className="h-8 w-8 text-cyan-500 stroke-[3px]" />
          </div>
        </div>
        
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black gradient-text tracking-tight">Transaction Confirmed!</h2>
            <p className="text-sm text-muted-foreground">
              Confirmed at {new Date(txResult.timestamp).toLocaleTimeString()}
            </p>
          </div>

          <div className="grid grid-cols-2 border rounded-xl overflow-hidden divide-x divide-y">
            <div className="p-4 bg-muted/30">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Amount Sent</label>
              <p className="font-mono font-bold text-lg">{txResult.amount} {NATIVE_SYMBOL}</p>
            </div>
            <div className="p-4 bg-muted/30 border-t-0">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Network Fee</label>
              <p className="font-mono text-lg">{txResult.fee} {NATIVE_SYMBOL}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Status</label>
              <div className="flex items-center gap-1.5 text-cyan-500 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Confirmed</span>
              </div>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Network</label>
              <p className="text-sm font-semibold">{ACTIVE_CHAIN.name}</p>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Transaction Hash</label>
             <div className="flex gap-2 p-3 bg-muted rounded-lg border border-border/50 group">
                <code className="flex-1 text-xs font-mono break-all leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
                  {txResult.txHash}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => {
                  navigator.clipboard.writeText(txResult.txHash)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}>
                   {copied ? <CheckCircle2 className="h-4 w-4 text-cyan-500" /> : <Copy className="h-4 w-4" />}
                </Button>
             </div>
          </div>

          <div className="pt-2 flex flex-col items-center gap-4">
            <div className="text-sm font-medium p-4 rounded-xl bg-primary/5 border border-primary/10 w-full text-center">
              <span className="text-muted-foreground">New Balance: </span>
              <span className="text-primary font-bold text-lg">{balance.toFixed(4)} {NATIVE_SYMBOL}</span>
            </div>
            
            <div className="flex gap-3 w-full">
              <Button className="flex-1 bg-primary py-6" onClick={() => window.open(explorerTxUrl(txResult.txHash), '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </Button>
              <Button variant="outline" className="flex-1 py-6" onClick={resetForm}>
                Send Another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'FAILURE' && txResult && !txResult.success) {
    return (
      <Card className="border-rose-500/20 bg-card overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="bg-rose-500/5 px-6 py-6 flex flex-col items-center gap-4 border-b border-rose-500/10 text-center">
           <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center">
             <AlertCircle className="h-10 w-10 text-rose-500" />
           </div>
           <div className="space-y-1">
             <h2 className="text-xl font-bold text-rose-500">Transaction Failed</h2>
             <p className="text-sm text-muted-foreground">{txResult.error}</p>
           </div>
        </div>
        <CardContent className="p-6 space-y-6">
           <div className="space-y-4">
              <h4 className="text-center font-bold text-sm">Common issues and solutions:</h4>
              <ul className="space-y-3">
                 <li className="flex gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <div className="p-1.5 h-7 w-7 rounded-full bg-rose-500/20 shrink-0 flex items-center justify-center">
                      <span className="text-[10px] font-black">01</span>
                    </div>
                    <div>
                       <p className="text-xs font-bold mb-1">Insufficient Balance</p>
                       <p className="text-[10px] text-muted-foreground leading-relaxed">Add more {NATIVE_SYMBOL} to your wallet or reduce the amount being sent.</p>
                    </div>
                 </li>
                 <li className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="p-1.5 h-7 w-7 rounded-full bg-primary/20 shrink-0 flex items-center justify-center">
                      <span className="text-[10px] font-black">02</span>
                    </div>
                    <div>
                       <p className="text-xs font-bold mb-1">Not Enough Gas</p>
                       <p className="text-[10px] text-muted-foreground leading-relaxed">Gas is paid in {NATIVE_SYMBOL} on top of the amount — keep a little spare.</p>
                    </div>
                 </li>
              </ul>
           </div>
           
           {txResult.code && (
             <div className="p-2 border rounded bg-muted/50 text-center">
                <code className="text-[10px] font-mono opacity-60 uppercase">{txResult.code}</code>
             </div>
           )}

           <div className="flex gap-3">
              <Button className="flex-1 bg-primary" onClick={resetForm}>Try Again</Button>
              <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={() => window.location.href = '/contact'}>Get Help</Button>
           </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-border/40 bg-card overflow-hidden ${compact ? 'shadow-none border-none' : 'shadow-xl'}`}>
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send {NATIVE_SYMBOL}
          </CardTitle>
          <Badge className="bg-primary/20 text-primary border-none text-[9px] font-bold px-2 py-0.5">{ACTIVE_CHAIN.name}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          {/* Destination */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="destination" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destination Wallet</Label>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5" onClick={handlePaste}>
                <Clipboard className="h-3 w-3 mr-1" />
                Paste
              </Button>
            </div>
            <div className="relative">
               <Input 
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onBlur={() => validate()}
                placeholder="0x… (recipient address)"
                className={`font-mono text-xs pr-10 py-5 border-2 transition-all duration-200 ${errors.destination ? 'border-rose-500/50 bg-rose-500/5' : destination && !errors.destination ? 'border-cyan-500/50 bg-cyan-500/5' : 'focus:border-primary/50'}`}
              />
              {destination && !errors.destination && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500" />}
              {errors.destination && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 animate-pulse" />}
            </div>
            {errors.destination && <p className="text-[10px] font-bold text-rose-500">{errors.destination}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount to Send</Label>
              <p className="text-[10px] font-medium text-muted-foreground">
                Spendable: <span className="text-primary font-bold">{spendable.toFixed(4)} {NATIVE_SYMBOL}</span>
              </p>
            </div>
            <div className="relative">
              <Input 
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0000"
                className={`font-mono py-5 border-2 transition-all duration-200 ${errors.amount ? 'border-rose-500/50 bg-rose-500/5' : 'focus:border-primary/50'}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 font-black border border-primary/20 text-primary hover:bg-primary/10" onClick={() => setAmount(spendable.toFixed(6))}>MAX</Button>
                <span className="text-xs font-black text-muted-foreground">{NATIVE_SYMBOL}</span>
              </div>
            </div>
            {errors.amount && <p className="text-[10px] font-bold text-rose-500">{errors.amount}</p>}
          </div>

          {/* Memo */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between">
              <Label htmlFor="memo" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Memo (Optional)</Label>
              <span className={`text-[10px] font-bold ${memo.length > 64 ? 'text-rose-500' : 'text-muted-foreground'}`}>{memo.length}/64</span>
            </div>
            <Input 
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, 64))}
              placeholder="Ref: Payroll APR-2026"
              className="text-xs py-5 border-2 focus:border-primary/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="pt-2">
           <div className="space-y-1 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center opacity-60">
                 <span className="text-[10px] font-bold uppercase tracking-widest">Network Fee</span>
                 <span className="text-[10px] font-mono font-bold">~{gasFee.toFixed(6)} {NATIVE_SYMBOL}</span>
              </div>
              <p className="text-[9px] text-muted-foreground italic">Estimated gas at the current price — the wallet quotes the final cost.</p>
           </div>

           <Button 
            className="w-full py-7 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 group transition-all"
            disabled={!destination || !amount || !!errors.destination || !!errors.amount}
            onClick={handleSend}
          >
            <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Send {NATIVE_SYMBOL}
          </Button>
          
          {destination && !errors.destination && amount && !errors.amount && (
            <p className="mt-4 text-center text-[10px] font-medium text-muted-foreground animate-in fade-in slide-in-from-top-1">
              Sending {amount} {NATIVE_SYMBOL} to <span className="font-mono text-primary font-bold">{destination.slice(0, 8)}...{destination.slice(-8)}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
