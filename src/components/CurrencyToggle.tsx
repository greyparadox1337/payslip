"use client";

import React, { useEffect } from "react";
import { useCurrencyStore } from "@/store/currencyStore";
import { CircleDollarSign, Coins } from "lucide-react";

export function CurrencyToggle() {
  const { currency, toggleCurrency, refreshRate } = useCurrencyStore();

  useEffect(() => {
    refreshRate();
  }, [refreshRate]);

  return (
    <div className="flex bg-card border border-border/30 rounded-full p-1 shadow-inner h-10 w-44 relative overflow-hidden transition-colors">
      <button
        onClick={() => currency !== "ETH" && toggleCurrency()}
        className={`flex-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold tracking-wide rounded-full z-10 transition-all ${
          currency === "ETH"
            ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Coins className="h-3.5 w-3.5" />
        ETH
      </button>

      <button
        onClick={() => currency !== "USDC" && toggleCurrency()}
        className={`flex-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold tracking-wide rounded-full z-10 transition-all ${
          currency === "USDC"
            ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <CircleDollarSign className="h-3.5 w-3.5" />
        USDC
      </button>
    </div>
  );
}
