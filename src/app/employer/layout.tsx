"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { SessionWatcher } from "@/components/SessionWatcher";
import { OrgProvider } from "@/lib/context/OrgContext";
import WalletStatusBar from "@/components/shared/WalletStatusBar";
import Level1StatusBadge from "@/components/shared/Level1StatusBadge";
import { isOnRobinhoodChain } from "@/lib/chain";
import { ACTIVE_CHAIN } from "@/lib/chains";

export default function EmployerLayout({
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
        setWrongNetwork(!(await isOnRobinhoodChain()))
      } catch {
        // No wallet installed, handled by WalletManager
      }
    }
    checkNetwork()
    // Check every 10s in case user switches network in extension
    const interval = setInterval(checkNetwork, 10000)
    return () => clearInterval(interval)
  }, [])

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="hidden lg:flex w-64 flex-col bg-card border-r border-border/20 p-6">
          <div className="h-10 bg-white/5 rounded-lg mb-10 w-2/3 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="mt-auto h-16 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-20 border-b border-border/20 bg-card/50 flex items-center px-8">
             <div className="h-8 bg-white/5 rounded-lg w-48 animate-pulse" />
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "employer") {
    redirect("/login");
    return null;
  }

  return (
    <OrgProvider>
      <SessionWatcher />
      <div className="flex flex-col h-screen relative">
        {wrongNetwork && (
          <div className="w-full bg-rose-600 text-white py-2 px-4 flex items-center justify-center gap-2 z-[100] animate-in slide-in-from-top duration-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Wrong Network: Switch your wallet to {ACTIVE_CHAIN.name} to use PaySlip
            </span>
          </div>
        )}
        <WalletStatusBar />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        <Level1StatusBadge />
      </div>
    </OrgProvider>
  );
}
