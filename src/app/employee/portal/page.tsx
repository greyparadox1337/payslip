"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useCallback, useEffect } from "react";
import {
  FileText,
  Wallet,
  ExternalLink,
  LogOut,
  CheckCircle2,
  Coins,
  ArrowDownLeft,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  connectWallet,
  checkWalletConnection,
  getTransactionHistory,
  type PaymentRecord,
} from "@/lib/chain";
import WalletManager from "@/components/shared/WalletManager";
import SendPanel from "@/components/shared/SendPanel";
import { History } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { explorerTxUrl, EXPLORER_URL } from '@/lib/chains';

/* ─────────────────────────────────────────────
 *  Helpers
 * ───────────────────────────────────────────── */

function truncateAddress(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

function formatETH(amount: string) {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonth(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function explorerUrl(txHash: string) {
  return explorerTxUrl(txHash);
}

/* ─────────────────────────────────────────────
 *  Component: Connect Wallet Screen
 * ───────────────────────────────────────────── */

function ConnectScreen({
  onConnect,
  loading,
  error,
}: {
  onConnect: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <Card className="border-[1px] border-[rgba(99,102,241,0.2)] shadow-[0_0_40px_rgba(99,102,241,0.1)] overflow-hidden">
          {/* Gradient header */}
          <div className="relative h-44 bg-card flex items-center justify-center overflow-hidden border-b border-border/20">
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />
            <div className="absolute top-6 left-6 h-16 w-16 rounded-full bg-cyan-400/10 blur-xl" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/40 mb-3">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Payslip</h1>
              <p className="text-[13px] text-indigo-200/80 mt-0.5">
                Employee Portal
              </p>
            </div>
          </div>

          <CardContent className="p-8 pt-7">
            <div className="text-center mb-7">
              <h2 className="text-lg font-semibold text-foreground">
                Connect Your Wallet
              </h2>
              <p className="text-[13.5px] text-muted-foreground mt-1.5 leading-relaxed">
                Sign in securely with your MetaMask wallet.
                <br />
                No passwords needed — your wallet is your identity.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
                {error}
              </div>
            )}

            <Button
              onClick={onConnect}
              disabled={loading}
              className="w-full h-12 gap-2.5 text-[14px] font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              id="connect-wallet-btn"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wallet className="h-5 w-5" />
              )}
              {loading ? "Connecting…" : "Connect MetaMask Wallet"}
            </Button>

            <div className="flex items-center gap-2 justify-center mt-5 text-[12px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured by Botchain Network · Testnet
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[12px] text-slate-400 mt-5">
          Don&apos;t have MetaMask?{" "}
          <a
            href="https://metamask.io/download"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-600 underline underline-offset-2"
          >
            Download here
          </a>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Component: Payslip Card
 * ───────────────────────────────────────────── */

function PayslipCard({ record }: { record: PaymentRecord }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/payslip-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: record.transactionHash,
          employeeName: truncateAddress(record.to || ""),
          amount: record.amount,
          date: formatDate(record.createdAt),
        }),
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${formatDate(record.createdAt).replace(/[\\s,]+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-5">
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <ArrowDownLeft className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14.5px] font-semibold text-foreground">
                  {formatMonth(record.createdAt)}
                </h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5 font-mono">
                  {formatDate(record.createdAt)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[17px] font-bold text-foreground font-mono">
                  {formatETH(record.amount)}
                  <span className="text-[12px] font-medium text-muted-foreground ml-1 font-sans">
                    ETH
                  </span>
                </p>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border/10">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[11px] font-semibold gap-1 hover:bg-cyan-500/15"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Confirmed
                </Badge>
                
                <a
                  href={explorerUrl(record.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
                  id={`view-tx-${record.id}`}
                >
                  View on Botchain Expert
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="h-7 px-2 text-[11.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                {downloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                {downloading ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
 *  Component: Loading Skeletons
 * ───────────────────────────────────────────── */

function PayslipSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border/10">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
 *  Component: Empty State
 * ───────────────────────────────────────────── */

function EmptyPayslips() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6 h-[120px] w-[120px] rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
        <FileText className="h-12 w-12 text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">
        No payslips yet
      </h3>
      <p className="text-[13px] text-slate-500 mt-1.5 text-center max-w-sm leading-relaxed">
        When your employer runs payroll through Payslip, your payment records
        will appear here automatically.
      </p>
    </div>
  );
}

/* ═════════════════════════════════════════════
 *  Main Page
 * ═════════════════════════════════════════════ */

export default function EmployeePortal() {
  const { data: session } = useSession();
  const lastLoginValue = session?.user?.lastLogin;
  const lastLoginText = lastLoginValue
    ? formatDistanceToNow(
        new Date(lastLoginValue instanceof Date ? lastLoginValue : String(lastLoginValue)),
        { addSuffix: true }
      )
    : "First login";
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [payslips, setPayslips] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* ── Fetch payslips ── */
  const fetchPayslips = useCallback(async (address: string) => {
    setFetching(true);
    try {
      const records = await getTransactionHistory(address);
      setPayslips(records);
    } catch (err) {
      console.error("Failed to load payslips:", err);
      // Don't block the UI — just show empty
      setPayslips([]);
    } finally {
      setFetching(false);
    }
  }, []);

  /* ── Auto-Connect ── */
  useEffect(() => {
    const cachedWallet = localStorage.getItem("employeeWallet");
    if (cachedWallet) {
      setWalletAddress(cachedWallet);
      fetchPayslips(cachedWallet);
    }
  }, [fetchPayslips]);


  /* ── Connect wallet ── */
  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const connected = await checkWalletConnection();
      if (!connected) {
        setError(
          "MetaMask wallet not detected. Please install the MetaMask browser extension first."
        );
        setLoading(false);
        return;
      }
      const address = await connectWallet();
      setWalletAddress(address);
      localStorage.setItem("employeeWallet", address);
      fetchPayslips(address);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect wallet"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Disconnect ── */
  function handleDisconnect() {
    setWalletAddress(null);
    setPayslips([]);
    setError(null);
    localStorage.removeItem("employeeWallet");
  }

  /* ── Copy address ── */
  function handleCopy() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Compute totals ── */
  const totalReceived = payslips.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );

  /* ═══════════════════════════════════════════
   *  Connect Screen
   * ═══════════════════════════════════════════ */
  if (!walletAddress) {
    return (
      <ConnectScreen
        onConnect={handleConnect}
        loading={loading}
        error={error}
      />
    );
  }

  /* ═══════════════════════════════════════════
   *  Authenticated Dashboard
   * ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-transparent">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/25">
              <Coins className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-foreground">
              Payslip
            </span>
          </div>

          {/* Wallet address + disconnect */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border/20 hover:border-primary/50 px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors"
              title="Copy full address"
              id="copy-address-btn"
            >
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <code className="font-mono">
                {truncateAddress(walletAddress)}
              </code>
              {copied ? (
                <Check className="h-3 w-3 text-cyan-400" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              onClick={handleDisconnect}
              id="disconnect-wallet-btn"
              title="Disconnect wallet"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-0.5 text-[10.5px] text-muted-foreground font-mono">
            Last login: {lastLoginText}
          </div>
        </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-6">
        {/* ── Summary Card ── */}
        <Card className="relative overflow-hidden bg-card border-border/20 shadow-[0_0_40px_rgba(99,102,241,0.1)] text-foreground">
          {/* Decorative */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/10 blur-2xl" />

          <CardContent className="relative z-10 p-6 sm:p-7">
            <p className="text-[13px] text-muted-foreground font-medium">
              Total Received
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              {fetching ? (
                <Skeleton className="h-9 w-40 bg-white/10" />
              ) : (
                <>
                  <span className="text-[32px] font-bold tracking-tight font-mono">
                    {formatETH(String(totalReceived))}
                  </span>
                  <span className="text-[15px] text-muted-foreground font-medium">
                    ETH
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/10">
              <div>
                <p className="text-[11.5px] text-indigo-200/50 uppercase tracking-wider font-medium">
                  Payslips
                </p>
                {fetching ? (
                  <Skeleton className="h-5 w-8 bg-white/10 mt-1" />
                ) : (
                  <p className="text-[17px] font-bold mt-0.5">
                    {payslips.length}
                  </p>
                )}
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-[11.5px] text-indigo-200/50 uppercase tracking-wider font-medium">
                  Network
                </p>
                <p className="text-[13px] font-medium mt-1 text-indigo-200/80">
                  Botchain Testnet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botchain Wallet Section */}
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WalletManager />
            <SendPanel compact />
          </div>
          <Card className="bg-card border-border/20 shadow-xl overflow-hidden">
            <CardHeader className="py-4 border-b border-border/10 bg-muted/30">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">Recent Activity</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border/10">
                  {payslips.length > 0 ? (
                    payslips.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <ArrowDownLeft className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">ETH Received</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{tx.transactionHash.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-cyan-500">+{formatETH(tx.amount)} ETH</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                       <p className="text-xs text-muted-foreground italic font-medium">
                        Connect wallet to view ledger history
                      </p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Section Header ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Payment History
          </h2>
          {!fetching && (
            <button
              onClick={() => fetchPayslips(walletAddress)}
              className="text-[12.5px] font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
              id="refresh-payslips-btn"
            >
              Refresh
            </button>
          )}
        </div>

        {/* ── Payslip List ── */}
        {fetching ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <PayslipSkeleton key={i} />
            ))}
          </div>
        ) : payslips.length === 0 ? (
          <EmptyPayslips />
        ) : (
          <div className="space-y-3">
            {payslips.map((record) => (
              <PayslipCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/20 mt-12 backdrop-blur-sm bg-background/50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} Payslip · Powered by Botchain
          </p>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <a
              href="https://docs.Botchain.com/chain/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Botchain.org
            </a>
            <a
              href="https://metamask.io/download"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              MetaMask
            </a>
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
