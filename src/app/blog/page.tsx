"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { Zap, Calendar, Clock, User, ArrowRight, Mail, Sparkles, Filter } from "lucide-react";

// --- Article Metadata ---
type Category = "Product" | "Botchain" | "Payroll" | "Company" | "All";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: "Product" | "Botchain" | "Payroll" | "Company";
  author: string;
  readTime: string;
  date: string;
  accent: "indigo" | "sky" | "amber" | "fuchsia" | "cyan";
}

const articles: Article[] = [
  {
    id: 1,
    title: "Introducing PaySlip — Payroll for the Botchain Generation",
    excerpt: "The wait is over. PaySlip is officially live, bringing instant, near-zero cost payroll to teams worldwide using the Botchain.",
    category: "Product",
    author: "Parth Dhimman",
    readTime: "5 min",
    date: "April 2025",
    accent: "indigo"
  },
  {
    id: 2,
    title: "How Botchain makes global payroll 100x cheaper",
    excerpt: "Traditional wire transfers are relics of the past. Harnessing Botchain’s efficient consensus mechanism, PaySlip reduces fees to a fraction of a cent.",
    category: "Botchain",
    author: "Parth",
    readTime: "4 min",
    date: "March 2025",
    accent: "sky"
  },
  {
    id: 3,
    title: "Why we chose ETH over USDC for payroll",
    excerpt: "Exploring the liquidity, speed, and cross-border utility that makes ETH the native backbone of our instant disbursement engine.",
    category: "Payroll",
    author: "Alice",
    readTime: "6 min",
    date: "February 2025",
    accent: "amber"
  },
  {
    id: 4,
    title: "Building PaySlip in 48 hours at a hackathon",
    excerpt: "From a whiteboard concept to a fully functional Botchain payment engine: the story of our journey building at the hackathon name.",
    category: "Company",
    author: "The Team",
    readTime: "8 min",
    date: "January 2025",
    accent: "fuchsia"
  },
  {
    id: 5,
    title: "The roadmap to compliant USDC payslips",
    excerpt: "We’re working on integrated compliance layers for USDC payroll, ensuring global tax adherence without sacrificing on-chain speed.",
    category: "Product",
    author: "Parth",
    readTime: "4 min",
    date: "March 2025",
    accent: "cyan"
  }
];

const colorMap = {
  indigo: { badge: "bg-indigo-500/10 text-indigo-400", glow: "hover:border-indigo-500/60 shadow-indigo-500/5", grad: "from-indigo-500/30 to-indigo-900/10", text: "text-indigo-400" },
  sky: { badge: "bg-sky-500/10 text-sky-400", glow: "hover:border-sky-500/60 shadow-sky-500/5", grad: "from-sky-500/30 to-sky-900/10", text: "text-sky-400" },
  amber: { badge: "bg-amber-500/10 text-amber-400", glow: "hover:border-amber-500/60 shadow-amber-500/5", grad: "from-amber-500/30 to-amber-900/10", text: "text-amber-400" },
  fuchsia: { badge: "bg-fuchsia-500/10 text-fuchsia-400", glow: "hover:border-fuchsia-500/60 shadow-fuchsia-500/5", grad: "from-fuchsia-500/30 to-fuchsia-900/10", text: "text-fuchsia-400" },
  cyan: { badge: "bg-cyan-500/10 text-cyan-400", glow: "hover:border-cyan-500/60 shadow-cyan-500/5", grad: "from-cyan-500/30 to-cyan-900/10", text: "text-cyan-400" },
};

// --- Featured Article Hero ---
function FeaturedHero({ article }: { article: Article }) {
  const c = colorMap["indigo"];
  return (
    <div className="relative group overflow-hidden rounded-[24px] bg-surfaceUp/30 border border-indigo-500/30 p-2 sm:p-4 mb-20">
      <div className="flex flex-col lg:flex-row items-stretch gap-8">
        {/* Visual Decoration */}
        <div className="lg:w-1/2 aspect-video lg:aspect-auto rounded-2xl bg-gradient-to-br from-indigo-600/20 via-fuchsia-600/10 to-transparent relative overflow-hidden flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.2),_transparent_70%)] animate-pulse" />
          <Zap className="h-32 w-32 text-indigo-400 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-fuchsia-500/10 blur-3xl animate-bounce" />
        </div>

        {/* Content */}
        <div className="lg:w-1/2 flex flex-col justify-center p-6 lg:pr-12">
          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.badge} mb-6 w-fit`}>
            {article.category} Update
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-textPrimary leading-tight mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-fuchsia-400 transition-all duration-300">
            {article.title}
          </h2>
          <p className="text-textMuted text-lg leading-relaxed mb-8">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-6 text-[11px] text-textHint font-bold uppercase tracking-widest mb-10">
            <span className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> {article.author}</span>
            <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {article.readTime} read</span>
            <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {article.date}</span>
          </div>
          <Link href="#" className="flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors w-fit group/link">
            Read article <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Article Card ---
function ArticleCard({ article }: { article: Article }) {
  const c = colorMap[article.accent];
  return (
    <div className={`flex flex-col bg-[#0f0f2e] rounded-2xl border border-white/5 ${c.glow} transition-all duration-300 group hover:-translate-y-2 shadow-xl`}>
      {/* Colored Visual Area */}
      <div className={`h-[180px] w-full rounded-t-2xl bg-gradient-to-br ${c.grad} p-8 flex items-center justify-center relative overflow-hidden border-b border-white/5`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10" />
        <div className={`w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          <Sparkles className={`h-8 w-8 ${c.text} opacity-50`} />
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${c.badge} mb-4 w-fit`}>
          {article.category}
        </span>
        <h3 className="text-lg font-bold text-textPrimary leading-snug mb-4 group-hover:text-white transition-colors capitalize">
          {article.title}
        </h3>
        <p className="text-sm text-textMuted leading-relaxed mb-6 line-clamp-2">
          {article.excerpt}
        </p>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-textHint font-bold uppercase tracking-tighter">{article.author}</span>
            <span className="text-[9px] text-textHint/60 uppercase">{article.date} · {article.readTime}</span>
          </div>
          <Link href="#" className={`text-xs font-bold ${c.text} hover:opacity-80 transition-opacity`}>
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Newsletter Signup ---
function NewsletterSignup() {
  return (
    <div className="relative mt-32 p-[1px] rounded-3xl overflow-hidden group">
      <div className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,#6366f1,#d946ef,#6366f1)] opacity-30" />
      <div className="relative bg-[#0a0a1a] rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(99,102,241,0.05),_transparent_50%)]" />
        
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Stay updated on PaySlip and Botchain payroll</h2>
          <p className="text-textMuted text-base">
            Get the latest product updates, Botchain news, and payroll insights delivered straight to your inbox.
          </p>
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="bg-transparent border-none outline-none px-4 py-3 text-sm text-white placeholder:text-textMuted w-full sm:w-64"
            />
            <button className="bg-primary hover:bg-indigo-400 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-primary/25 transition-all">
              Subscribe
            </button>
          </div>
          <p className="text-[10px] text-textHint font-bold uppercase tracking-widest mt-4 text-center md:text-left opacity-60">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredArticles = activeCategory === "All" 
    ? articles.slice(1) // Exclude featured hero
    : articles.slice(1).filter(a => a.category === activeCategory);

  return (
    <PageLayout>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        
        {/* Featured Section */}
        <FeaturedHero article={articles[0]} />

        {/* Categories Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-16 border-b border-white/5 pb-8">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-textMuted" />
            <span className="text-[10px] font-bold text-textHint uppercase tracking-widest">Filter by category</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {(["All", "Product", "Botchain", "Payroll", "Company"] as Category[]).map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                  activeCategory === cat 
                    ? "bg-white text-black border-white" 
                    : "bg-surfaceUp/30 text-textMuted border-white/10 hover:border-white/30 hover:text-textPrimary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <Sparkles className="h-12 w-12 text-textMuted mb-6 opacity-20" />
              <h3 className="text-xl font-bold text-textMuted">No articles found in this category yet.</h3>
              <p className="text-textHint text-sm">Stay tuned for more updates!</p>
            </div>
          )}
        </div>

        {/* Newsletter Cleanup */}
        <NewsletterSignup />

      </main>

    </PageLayout>
  );
}
