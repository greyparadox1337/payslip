"use client";

import { useState } from "react";
import { Copy, Check, QrCode, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
  address: string;
  label?: string;
}

export default function QRCodeDisplay({ address, label = "Wallet Address" }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500"></div>

      <div className="relative z-10 w-full flex flex-col items-center translate-y-0 hover:-translate-y-1 transition-transform duration-300">
        {/* Simplified Mock QR Code for hackathon UI */}
        <div className="h-48 w-48 bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden group/qr">
           <div className="h-full w-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}')] bg-cover bg-center"></div>
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
              <QrCode className="h-10 w-10 text-white animate-pulse" />
           </div>
        </div>

        <div className="mt-8 text-center space-y-4 w-full">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">{label}</div>
            <div className="font-mono text-[13px] text-white/90 break-all bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors">
              {address}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <Button 
              onClick={handleCopy}
              className={`flex-1 h-11 font-bold gap-2 transition-all border ${copied ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20' : 'bg-white/5 text-white border-white/10 hover:bg-indigo-500 hover:border-indigo-400'}`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy Address'}
            </Button>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 group-hover:text-indigo-400">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-2">
             <ShieldCheck className="h-3 w-3 text-indigo-500" />
             Verified On Robinhood Chain
          </div>
        </div>
      </div>
    </div>
  );
}
