"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { SessionWatcher } from "@/components/SessionWatcher";
import WalletStatusBar from "@/components/shared/WalletStatusBar";
import Level1StatusBadge from "@/components/shared/Level1StatusBadge";
import { isOnBotChain } from "@/lib/chain";
import { ACTIVE_CHAIN } from "@/lib/chains";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    async function checkNetwork() {
      if (typeof window === 'undefined') return
      try {
        setWrongNetwork(!(await isOnBotChain()))
      } catch {
        // No wallet installed
      }
    }
    checkNetwork()
    const interval = setInterval(checkNetwork, 10000)
    return () => clearInterval(interval)
  }, [])

  if (status === "loading") {
    return (
       <div className="min-h-screen bg-background flex flex-col">
        <div className="h-20 border-b border-border/20 bg-card/50 flex items-center px-8 justify-between">
           <div className="h-8 bg-white/5 rounded-lg w-48 animate-pulse" />
           <div className="h-10 bg-white/5 rounded-lg w-32 animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin opacity-50" />
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "employee") {
    redirect("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <SessionWatcher />
      {wrongNetwork && (
        <div className="w-full bg-rose-600 text-white py-2 px-4 flex items-center justify-center gap-2 z-[100] animate-in slide-in-from-top duration-300">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Wrong Network: Switch your wallet to {ACTIVE_CHAIN.name} to use PaySlip
          </span>
        </div>
      )}
      <WalletStatusBar />
      <div className="flex-1">
        {children}
      </div>
      <Level1StatusBadge />
    </div>
  );
}
