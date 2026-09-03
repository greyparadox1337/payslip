"use client";

import React from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { Zap, Globe, Eye, Zap as Lightning, Satellite, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <PageLayout>

      {/* About Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
        {/* Background mesh + violet radial */}
        <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(139,92,246,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-fuchsia-400 text-xs font-bold uppercase tracking-widest mb-8 animate-[slideDown_0.6s_ease-out]">
            Our story
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">
            We believe payroll should be <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              as borderless as the internet
            </span>
          </h1>
          <p className="text-textMuted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            PaySlip was born from a simple frustration — international payroll is broken. Too slow, too expensive, and too exclusionary. We built the fix.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-surface overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative flex flex-col items-center">
            <div className="absolute left-0 lg:left-24 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-transparent hidden sm:block h-32 lg:h-48" />
            
            <div className="max-w-4xl text-center space-y-8 pl-0 sm:pl-12 lg:pl-0">
              <h2 className="text-3xl sm:text-4xl font-semibold leading-tight text-textPrimary tracking-tight">
                &ldquo;Our mission is to make paying anyone, anywhere, <br />
                <span className="gradient-text">
                  as simple as sending a message.
                </span>&rdquo;
              </h2>
              <p className="text-textMuted text-lg font-medium">
                And blockchain makes it possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-32">
          
          {/* Block 1: The Problem */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1 border-l-4 border-violet-500 pl-8">
              <h3 className="text-2xl font-bold text-violet-400 uppercase tracking-widest">The problem we saw</h3>
              <p className="text-lg text-textMuted leading-relaxed">
                International payroll is stuck in the 1970s. Relying on correspondent banking means cross-border payments take 3–5 days to clear, incur 3–7% in fees, and leave over a billion people excluded simply because they lack a traditional bank account.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded">
                Legacy systems: 3–5 days delay
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative p-8 rounded-3xl bg-surfaceUp/30 border border-white/5 backdrop-blur-xl shadow-2xl">
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-xs text-textMuted font-bold uppercase tracking-widest">
                    <span>Average international payment</span>
                    <span className="text-red-400">Inefficient</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-2xl font-bold">3–5</p>
                        <p className="text-[10px] text-textMuted uppercase font-black">Days</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-2xl font-bold">7%</p>
                        <p className="text-[10px] text-textMuted uppercase font-black">Fees</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Why Botchain */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative p-10 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col items-center text-center group">
                <Zap className="h-16 w-16 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-2xl font-bold text-white mb-2">Botchain Network</h4>
                <p className="text-sm text-cyan-400/80 font-bold uppercase tracking-widest mb-6">Built for payments</p>
                <div className="grid grid-cols-2 gap-8 w-full border-t border-cyan-500/20 pt-8">
                  <div>
                    <p className="text-3xl font-bold text-white">5s</p>
                    <p className="text-[10px] text-cyan-400 uppercase font-black">Settlement</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">&lt;0.01¢</p>
                    <p className="text-[10px] text-cyan-400 uppercase font-black">Cost</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2 border-l-4 border-cyan-500 lg:border-l-0 lg:border-r-4 lg:pr-8 lg:text-right">
              <h3 className="text-2xl font-bold text-cyan-400 uppercase tracking-widest">Why Botchain</h3>
              <p className="text-lg text-textMuted leading-relaxed">
                Botchain processes transactions in under 5 seconds for a fraction of a cent. It&rsquo;s the only blockchain built specifically for payments and financial access. We chose Botchain because it shares our mission of financial inclusion.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-bold rounded">
                Optimal for high-velocity payroll
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Values Grid Section */}
      <section className="py-32 bg-surface">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Core values that drive us</h2>
            <div className="h-1 w-[60px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                title: "Accessible", 
                body: "Anyone with a wallet can receive payment. No bank required. We bridge the gap for the unbanked.",
                icon: Globe,
                color: "cyan"
              },
              { 
                title: "Transparent", 
                body: "Every payment is public on the Botchain ledger. No hidden fees, ever. Total immutable audit trail.",
                icon: Eye,
                color: "sky"
              },
              { 
                title: "Fast", 
                body: "5-second finality. Because your team shouldn't wait for their money. Instant liquidity when they need it.",
                icon: Lightning,
                color: "amber"
              },
              { 
                title: "Global", 
                body: "40+ countries reached. Borders are a legacy problem. We handle the complexity so you don't have to.",
                icon: Satellite,
                color: "fuchsia"
              },
            ].map((v, i) => (
              <div key={i} className={`p-8 rounded-2xl bg-surfaceUp/50 border border-white/5 border-t-4 shadow-xl hover:-translate-y-2 transition-all duration-300 group ${
                v.color === "cyan" ? "border-t-cyan-500" :
                v.color === "sky" ? "border-t-sky-500" :
                v.color === "amber" ? "border-t-amber-500" :
                "border-t-fuchsia-500"
              }`}>
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-colors ${
                  v.color === "cyan" ? "bg-cyan-500/10 text-cyan-400" :
                  v.color === "sky" ? "bg-sky-500/10 text-sky-400" :
                  v.color === "amber" ? "bg-amber-500/10 text-amber-400" :
                  "bg-fuchsia-500/10 text-fuchsia-400"
                }`}>
                  <v.icon className={`h-6 w-6 group-hover:scale-125 transition-transform duration-500`} />
                </div>
                <h4 className="text-xl font-bold mb-4">{v.title}</h4>
                <p className="text-textMuted leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Botchain Partnership Footer */}
      <section className="py-24 text-center px-6 border-t border-border/20">
        <p className="text-sm font-bold text-textHint uppercase tracking-widest mb-8">Proud to build on</p>
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center gap-4 group cursor-default">
            <Zap className="h-12 w-12 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="h-10 w-px bg-white/20" />
            <div className="text-left">
              <p className="text-xl font-black tracking-tighter">Botchain</p>
              <p className="text-[10px] font-bold text-textHint uppercase tracking-widest">Development Foundation</p>
            </div>
          </div>
          <p className="max-w-xl text-textMuted leading-relaxed">
            PaySlip is built on the Botchain, chosen for its speed, low cost, and mission alignment with financial inclusion.
          </p>
        </div>
        <Link 
          href="https://docs.Botchain.com/chain/" 
          target="_blank"
          className="inline-flex items-center gap-2 text-sky-400 font-bold hover:text-sky-300 transition-colors"
        >
          Learn more about Botchain <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

    </PageLayout>
  );
}
