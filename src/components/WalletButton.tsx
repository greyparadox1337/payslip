"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  Wallet, 
  Loader2, 
  ChevronDown, 
  Copy, 
  Globe2, 
  LogOut, 
  ExternalLink 
} from "lucide-react";
import { checkWalletConnection, connectWallet } from "@/lib/chain";
import { useToast } from "@/contexts/ToastContext";

function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function WalletButton() {
  const { data: session, update } = useSession();
  const { addToast } = useToast();
  const [walletInstalled, setWalletInstalled] = useState<boolean | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check MetaMask presence
    const checkWallet = async () => {
      try {
        const connected = await checkWalletConnection();
        setWalletInstalled(true);
        if (connected) {
          const pubKey = await connectWallet();
          setAddress(pubKey);
        }
      } catch (err) {
        setWalletInstalled(false); // Throws or fails if completely missing
      }
    };
    checkWallet();

    // Setup listener to click-outside for dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = async () => {
    if (!walletInstalled) return; // Prevent connecting if not installed
    
    setIsConnecting(true);
    try {
      const pubKey = await connectWallet();
      setAddress(pubKey);
      
      // If user is logged in but has no linked wallet, link it now
      if (session?.user && !(session.user as any).linkedWallet) {
        try {
          const res = await fetch("/api/user/link-wallet", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: pubKey }),
          });
          if (res.ok) {
            await update({ linkedWallet: pubKey });
            addToast("Wallet linked to your account", "success");
          }
        } catch (linkErr) {
          console.error("Failed to link wallet:", linkErr);
        }
      }

      addToast(`Connected to Botchain Testnet · ${truncateAddress(pubKey)}`, "success");
    } catch (err) {
      addToast("Connection request rejected or failed", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setDropdownOpen(false);
    addToast("Wallet disconnected", "info");
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      addToast("Address copied to clipboard", "success");
      setDropdownOpen(false);
    }
  };

  const handleNetworkSwitch = () => {
    addToast("Mainnet deployment requires production environment", "info");
    setDropdownOpen(false);
  };

  if (walletInstalled === false) {
    return (
      <div className="relative group w-full">
        <a 
          href="https://metamask.io/download" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors">
            Install MetaMask
            <ExternalLink className="h-4 w-4" />
          </button>
        </a>
      </div>
    );
  }

  // Not connected
  if (!address) {
    return (
      <button 
        onClick={handleConnect}
        disabled={isConnecting}
        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border
          ${isConnecting 
            ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] text-primary" 
            : "bg-transparent border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
          }`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect MetaMask
          </>
        )}
      </button>
    );
  }

  // Connected State
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-background border border-border/40 hover:bg-white/[0.04] hover:border-border rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </div>
          <span className="font-mono text-[12px] font-medium text-foreground tracking-wide">
            {truncateAddress(address)}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute top-12 left-0 right-0 bg-card border border-border/40 shadow-xl rounded-lg p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <button onClick={handleCopy} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] rounded-md transition-colors">
            <Copy className="h-4 w-4" />
            Copy Address
          </button>
          <button onClick={handleNetworkSwitch} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-md transition-colors">
            <Globe2 className="h-4 w-4" />
            Switch to Mainnet
          </button>
          <div className="h-[1px] w-full bg-border/40 my-1" />
          <button onClick={handleDisconnect} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
            <LogOut className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
