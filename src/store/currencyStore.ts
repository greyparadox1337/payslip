import { create } from "zustand";
import { fetchETHPrice } from "@/lib/price";

interface CurrencyState {
  currency: "ETH" | "USDC";
  ethUsdRate: number;
  lastUpdated: number | null;
  toggleCurrency: () => void;
  refreshRate: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: "ETH",
  ethUsdRate: 3000, // fallback default
  lastUpdated: null,
  toggleCurrency: () => {
    set((state) => ({ currency: state.currency === "ETH" ? "USDC" : "ETH" }));
  },
  refreshRate: async () => {
    const rate = await fetchETHPrice();
    set({ ethUsdRate: rate, lastUpdated: Date.now() });
  },
}));
