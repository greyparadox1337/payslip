"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ChevronDown, ChevronUp, Zap, Shield, Globe, Rocket } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    q: "Is there really no setup fee?",
    a: "Absolutely. Our 'Hobby' tier is designed for early-stage teams and hackathon projects. You can sign up, link your wallet, and start paying your team immediately without ever entering a credit card. We only charge a small 0.1% fee on transactions in the Enterprise tier."
  },
  {
    q: "Can I pay in USDC instead of ETH?",
    a: "Yes. PaySlip supports any asset on the Robinhood Chain, with native support for ETH and Circle's USDC. You can choose the asset per-employee, allowing for a hybrid stable-volatile payroll strategy."
  },
  {
    q: "What happens if a transaction fails?",
    a: "Robinhood Chain transactions are atomic. If a ledger closes and your payment isn't included (due to insufficient funds or network congestion), the 'Payroll Tracker' will notify you immediately. You can then retry the specific failed recipient without re-sending to the entire team."
  },
  {
    q: "Do my employees need a crypto wallet?",
    a: "Yes, every employee needs a EVM-compatible public address (0x…). We recommend the MetaMask extension for the best experience, but PaySlip can send to any valid EVM wallet address globally."
  },
  {
    q: "Is PaySlip audited or secure?",
    a: "PaySlip is built using the industry-standard viem and never stores your private keys. All transactions are signed locally via the MetaMask wallet, ensuring you maintain 100% custody of your funds at all times."
  }
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Background generic grid mapping */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#6366f10a_1px,transparent_1px),linear-gradient(to_bottom,#6366f10a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <main className="relative z-10 pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[12px] font-bold uppercase tracking-widest mb-6">
            Simple, Transparent, On-Chain
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tighter">
            Pricing that scales with your <span className="gradient-text">Robinhood Chain team</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Zero setup fees. Zero monthly subscriptions. Just pure, efficient payroll on the world's most performant network.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {/* Free Tier */}
          <div className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-2 duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Hobby</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {["Up to 5 employees", "Unlimited payroll runs", "Robinhood Chain ETH support", "MetaMask integration", "PDF Payslips"].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full btn-secondary h-12 font-bold text-[14px]">
              Deploy for Free
            </Link>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="group relative p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-500 text-[10px] font-black uppercase text-white rounded-bl-xl tracking-widest shadow-lg">
              Popular
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2 underline decoration-indigo-500 decoration-2 underline-offset-4">Scale</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$29</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {["Unlimited employees", "USDC & ETH splits", "Advanced Analytics", "Custom CSV Export", "API Access (Beta)"].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full btn-primary h-12 font-bold shadow-indigo-500/25 text-[14px]">
              Scale Up Now
            </Link>
          </div>

          {/* Custom Tier */}
          <div className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-fuchsia-500/30 transition-all hover:-translate-y-2 duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Protocol</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {["Whitelabel PDF theme", "SSO & SAML Login", "Priority Support", "Pre-funded Escrows", "24/7 Monitoring"].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-400 opacity-80">
                  <Check className="h-4 w-4 text-fuchsia-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="w-full btn-secondary h-12 font-bold text-[14px] border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/10">
              Contact Sales
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto mb-32">
          <h2 className="text-3xl font-extrabold text-white mb-12 text-center tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-white tracking-tight leading-snug pr-4">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="h-5 w-5 text-indigo-400" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-6xl mx-auto">
          <div className="p-12 md:p-16 rounded-[40px] bg-gradient-to-br from-indigo-600/80 to-fuchsia-600/80 relative overflow-hidden text-center group">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">Ready to join the financial frontier?</h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-medium">Join 500+ global teams paying their world-class talent natively on Robinhood Chain.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="px-10 h-14 bg-white text-indigo-600 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl">
                  Get Started for Free
                </Link>
                <Link href="/about" className="px-10 h-14 bg-white/10 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md">
                   Meet the Team
                </Link>
              </div>
            </div>
            
            {/* Decorative orbs */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-indigo-400/30 rounded-full blur-[80px]"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
