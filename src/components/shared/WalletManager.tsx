'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  isWalletInstalled,
  connectInjectedWallet,
  disconnectWallet,
  getNativeBalance,
  isOnRobinhoodChain,
  switchToRobinhoodChain,
  parseChainError,
  NATIVE_SYMBOL
} from '@/lib/chain'
import { ACTIVE_CHAIN, FAUCET_URL, explorerAddressUrl } from '@/lib/chains'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Wallet, AlertTriangle, CheckCircle2, RefreshCw, Copy, ExternalLink, Unlink, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function WalletManager() {
  const [status, setStatus] = useState<'LOADING' | 'NOT_INSTALLED' | 'WRONG_NETWORK' | 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('LOADING')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const checkStatus = useCallback(async () => {
    try {
      const installed = await isWalletInstalled()
      if (!installed) {
        setStatus('NOT_INSTALLED')
        return
      }

      if (!(await isOnRobinhoodChain())) {
        setStatus('WRONG_NETWORK')
        return
      }

      // Check if we have a saved address in localStorage to auto-connect
      const savedAddress = localStorage.getItem('wallet_address')
      if (savedAddress) {
        setAddress(savedAddress)
        const bal = await getNativeBalance(savedAddress)
        setBalance(bal)
        setStatus('CONNECTED')
      } else {
        setStatus('DISCONNECTED')
      }
    } catch (err) {
      setStatus('DISCONNECTED')
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Auto-refresh balance every 60s
  useEffect(() => {
    if (status === 'CONNECTED' && address) {
      const interval = setInterval(async () => {
        const bal = await getNativeBalance(address)
        setBalance(bal)
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [status, address])

  // Clear error after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleConnect = async () => {
    setStatus('CONNECTING')
    setError(null)
    try {
      const { address: connected } = await connectInjectedWallet()
      setAddress(connected)
      localStorage.setItem('wallet_address', connected)
      const bal = await getNativeBalance(connected)
      setBalance(bal)
      setStatus('CONNECTED')
    } catch (err: any) {
      setError(err.message)
      setStatus('DISCONNECTED')
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    localStorage.removeItem('wallet_address')
    setAddress('')
    setBalance(0)
    setStatus('DISCONNECTED')
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const bal = await getNativeBalance(address)
    setBalance(bal)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // The Robinhood Chain testnet faucet is a hosted page with no programmatic
  // drip endpoint, so we open it and re-read the balance when the user returns.
  const handleFund = () => {
    window.open(`${FAUCET_URL}?address=${address}`, '_blank', 'noopener,noreferrer')
  }

  const handleSwitchNetwork = async () => {
    setError(null)
    try {
      await switchToRobinhoodChain()
      await checkStatus()
    } catch (err: unknown) {
      setError(parseChainError(err))
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'LOADING') {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (status === 'NOT_INSTALLED') {
    return (
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-lg">Wallet Required</CardTitle>
          </div>
          <CardDescription>Install an EVM wallet to use PaySlip on {ACTIVE_CHAIN.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => window.open('https://metamask.io/download', '_blank')}
          >
            Install MetaMask
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'WRONG_NETWORK') {
    return (
      <Card className="border-rose-500/50 bg-rose-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-lg">Wrong Network Detected</CardTitle>
          </div>
          <CardDescription>Please switch your wallet to {ACTIVE_CHAIN.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-black/10 p-3 text-sm space-y-2">
            <p className="font-medium">Network details:</p>
            <ul className="space-y-1 text-xs font-mono">
              <li>Chain ID: <strong>{ACTIVE_CHAIN.id}</strong></li>
              <li>RPC: <strong>{ACTIVE_CHAIN.rpcUrls.default.http[0]}</strong></li>
              <li>Currency: <strong>{NATIVE_SYMBOL}</strong></li>
            </ul>
          </div>
          <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white" onClick={handleSwitchNetwork}>
            Switch to {ACTIVE_CHAIN.name}
          </Button>
          <Button variant="outline" className="w-full" onClick={checkStatus}>
            Check Network Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'DISCONNECTED' || status === 'CONNECTING') {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-all duration-1000 group">
            <Wallet className={`h-6 w-6 text-primary ${status === 'DISCONNECTED' ? 'animate-pulse' : ''}`} />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Required to sign transactions on {ACTIVE_CHAIN.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full py-6 text-lg bg-primary hover:bg-primary/90" 
            disabled={status === 'CONNECTING'}
            onClick={handleConnect}
          >
            {status === 'CONNECTING' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
          </Button>
          {status === 'CONNECTING' && (
            <p className="text-center text-xs text-muted-foreground animate-pulse">
              Please approve the connection in your wallet
            </p>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/40 bg-card shadow-lg overflow-hidden">
      <div className="bg-primary/5 px-6 py-3 flex items-center justify-between border-b border-primary/10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Connected to {ACTIVE_CHAIN.name}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Chain {ACTIVE_CHAIN.id}</span>
      </div>
      
      <CardContent className="p-6 space-y-6">
        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wallet Address</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono tracking-tight overflow-hidden text-ellipsis">
              {address.slice(0, 8)}...{address.slice(-8)}
            </code>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={copyAddress}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-cyan-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => window.open(explorerAddressUrl(address), '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{NATIVE_SYMBOL} Balance</label>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary tracking-tighter">
              {balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
            </span>
            <span className="text-sm font-bold text-muted-foreground">{NATIVE_SYMBOL}</span>
          </div>
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-primary/5 text-primary border-primary/20">
            {ACTIVE_CHAIN.name}
          </Badge>

          {balance === 0 && ACTIVE_CHAIN.testnet && (
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-primary/80">
                <Info className="h-3 w-3" />
                <span>New wallet — claim testnet {NATIVE_SYMBOL} for gas</span>
              </div>
              <Button size="sm" className="w-full bg-primary" onClick={handleFund}>
                Open Faucet
              </Button>
              <Button size="sm" variant="ghost" className="w-full text-xs" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "I've funded it — refresh"}
              </Button>
            </div>
          )}
        </div>

        <Button 
          variant="ghost" 
          className="w-full mt-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 group"
          onClick={handleDisconnect}
        >
          <Unlink className="h-4 w-4 mr-2 group-hover:animate-bounce" />
          Disconnect Wallet
        </Button>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
