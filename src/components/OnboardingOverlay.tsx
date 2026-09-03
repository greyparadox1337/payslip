"use client";

import React, { useState, useEffect } from "react";
import { Coins, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    title: "Welcome to PaySlip",
    description: "The enterprise-grade payroll system running natively on the Botchain.",
    icon: <Coins className="h-12 w-12 text-primary" />,
  },
  {
    title: "Connect Your Wallet",
    description: "Link your MetaMask browser extension to securely authorize, sign, and fund global disbursements.",
    icon: (
      <div className="flex items-center justify-center space-x-2">
        <div className="h-10 w-10 bg-card rounded-full shadow-lg border-2 border-indigo-500 shrink-0" />
        <div className="h-1 w-8 bg-indigo-500/20" />
        <div className="h-6 w-6 bg-cyan-400 rounded-full animate-pulse blur-[2px]" />
      </div>
    ),
  },
  {
    title: "Add The Team",
    description: "Onboard your employees instantly using just their public EVM wallet addresses. No routing numbers needed.",
    icon: (
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 w-8 bg-cyan-500/20 rounded-full border border-cyan-500" />
        <div className="h-8 w-8 bg-primary/20 rounded-full border border-primary" />
        <div className="h-8 w-8 bg-cyan-400/20 rounded-full border border-cyan-400" />
        <div className="h-8 w-8 bg-slate-700 rounded-full border border-border" />
      </div>
    ),
  },
];

export function OnboardingOverlay() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    // Only check once on mount
    const hasOnboarded = localStorage.getItem("payslip-onboarded");
    if (!hasOnboarded) {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const nextSlide = () => {
    if (slide === SLIDES.length - 1) {
      localStorage.setItem("payslip-onboarded", "true");
      setOpen(false);
    } else {
      setSlide((s) => s + 1);
    }
  };

  const current = SLIDES[slide];

  return (
    <div className="fixed inset-0 z-[200] max-h-screen bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border/40 shadow-2xl overflow-hidden relative fade-in slide-in-from-bottom-8 animate-in duration-500">
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-400/10 rounded-full blur-[100px]" />

        <div className="relative z-10 px-10 py-16 flex flex-col items-center text-center h-[380px]">
          {/* Internal fade wrapper so content slides up securely */}
          <div key={slide} className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8">{current.icon}</div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{current.description}</p>
          </div>
          
          <Button 
            className="w-full mt-6 bg-white text-black hover:bg-slate-200 gap-2 h-12 rounded-xl font-semibold shadow-lg shadow-white/10 transition-transform active:scale-95"
            onClick={nextSlide}
          >
            {slide === SLIDES.length - 1 ? "Got it — Let's go!" : "Continue"}
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots */}
          <div className="flex items-center gap-2 mt-6">
            {SLIDES.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-white" : "w-1.5 bg-slate-700"
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
