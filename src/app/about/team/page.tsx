"use client";

import React from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { GitBranch, Send, Users, Plus, ExternalLink, Layout, Code, Rocket } from "lucide-react";

// --- Team Card Component ---
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  initials: string;
  accent: "indigo" | "violet" | "fuchsia" | "cyan";
  socials: { github?: string; twitter?: string; linkedin?: string };
}

const colorMap = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", hover: "hover:border-indigo-500/60", pill: "bg-indigo-500/20 text-indigo-400", avatar: "bg-indigo-500" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", hover: "hover:border-violet-500/60", pill: "bg-violet-500/20 text-violet-400", avatar: "bg-violet-500" },
  fuchsia: { bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", hover: "hover:border-fuchsia-500/60", pill: "bg-fuchsia-500/20 text-fuchsia-400", avatar: "bg-fuchsia-500" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", hover: "hover:border-cyan-500/60", pill: "bg-cyan-500/20 text-cyan-400", avatar: "bg-cyan-500" },
};

function TeamCard({ member }: { member: TeamMember }) {
  const c = colorMap[member.accent];

  return (
    <div className={`p-8 rounded-2xl bg-surfaceUp/30 border ${c.border} ${c.hover} transition-all duration-300 group hover:-translate-y-2 flex flex-col items-center text-center shadow-xl`}>
      {/* Avatar */}
      <div className={`w-20 h-20 rounded-full ${c.avatar} flex items-center justify-center text-white text-2xl font-black mb-6 shadow-2xl`}>
        {member.initials}
      </div>

      <h3 className="text-[18px] font-semibold text-textPrimary mb-2 leading-tight">
        {member.name}
      </h3>
      
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.pill} mb-5`}>
        {member.role}
      </span>

      <p className="text-sm text-textMuted leading-relaxed mb-6">
        {member.bio}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {member.skills.map((s, i) => (
          <span key={i} className="px-2 py-1 bg-surface rounded-md text-[10px] font-medium border border-white/5 text-textMuted group-hover:text-textPrimary transition-colors">
            {s}
          </span>
        ))}
      </div>

      {/* Socials Row */}
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/5 w-full justify-center">
        {member.socials.github && (
          <a href="#" className="w-8 h-8 rounded-full bg-surfaceUp flex items-center justify-center text-textMuted hover:bg-white hover:text-black transition-all">
            <GitBranch className="h-4 w-4" />
          </a>
        )}
        {member.socials.twitter && (
          <a href="#" className="w-8 h-8 rounded-full bg-surfaceUp flex items-center justify-center text-textMuted hover:bg-sky-500 hover:text-white transition-all">
            <Send className="h-4 w-4" />
          </a>
        )}
        {member.socials.linkedin && (
          <a href="#" className="w-8 h-8 rounded-full bg-surfaceUp flex items-center justify-center text-textMuted hover:bg-sky-600 hover:text-white transition-all">
            <Users className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

// --- Join Team Card ---
function JoinTeamCard() {
  return (
    <div className="relative p-[2px] rounded-2xl overflow-hidden group cursor-pointer h-full">
      {/* Animated Rainbow Border */}
      <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,#6366f1,#d946ef,#fbbf24,#34d399,#6366f1)] opacity-40 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative h-full w-full bg-[#0f0f2e] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Plus className="h-8 w-8 bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent" />
        </div>
        
        <h3 className="text-xl font-bold mb-3">Your name here?</h3>
        <p className="text-sm text-textMuted leading-relaxed mb-8">
          We’re scaling fast and looking for remote-first talent. Competitive ETH/USDC salaries.
        </p>

        <Link href="/careers" className="w-full py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-xl text-xs font-bold hover:shadow-indigo-500/25 transition-all">
          See open roles →
        </Link>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const team: TeamMember[] = [
    {
      name: "Parth Karan",
      role: "Founder / CEO",
      bio: "Former Fintech engineer obsessed with cross-border payments. Building the infrastructure for the future of work.",
      skills: ["viem", "Golang", "Product"],
      initials: "PK",
      accent: "indigo",
      socials: { github: "#", twitter: "#", linkedin: "#" }
    },
    {
      name: "Alice Roberts",
      role: "Tech Lead",
      bio: "Passionate about building scalable distributed systems and high-throughput financial applications on Botchain.",
      skills: ["Rust", "Solidity", "Node.js"],
      initials: "AR",
      accent: "violet",
      socials: { github: "#", twitter: "#" }
    },
    {
      name: "Marcus Xavier",
      role: "Product Designer",
      bio: "Full-stack designer focused on creating intuitive, human-centered UI for complex blockchain payroll flows.",
      skills: ["Figma", "UI/UX", "Motion"],
      initials: "MX",
      accent: "fuchsia",
      socials: { twitter: "#", linkedin: "#" }
    },
    {
      name: "Sofia Yang",
      role: "Blockchain Dev",
      bio: "Specialist in Botchain and on-chain asset bridging. Ensuring secure and instant settlement for global teams.",
      skills: ["Solidity", "C++", "Smart Contracts"],
      initials: "SY",
      accent: "cyan",
      socials: { github: "#", linkedin: "#" }
    },
  ];

  return (
    <PageLayout>
      <div className="bg-base text-textPrimary selection:bg-indigo-500/30">
        {/* Team Hero Section */}
        <section className="relative py-24 px-6 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,_rgba(139,92,246,0.1),_transparent_40%)]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10 pt-12">
            <Link href="/careers" className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest mb-8 hover:bg-cyan-500/20 transition-all group">
              We&apos;re hiring <ExternalLink className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">
              The team behind <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                PaySlip
              </span>
            </h1>
            <p className="text-textMuted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              A small team obsessed with making payroll better for everyone. From startup founders to global developers, we’re built for access.
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-24 px-6 relative">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {team.map((member, i) => (
                <TeamCard key={i} member={member} />
              ))}
              <JoinTeamCard />
            </div>
          </div>
        </section>

        {/* Team Values / Beliefs Section */}
        <section className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-center">
            <div className="flex flex-col items-center gap-4">
              <Layout className="h-8 w-8 text-violet-400" />
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Design Driven</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Code className="h-8 w-8 text-indigo-400" />
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Engineering First</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Rocket className="h-8 w-8 text-cyan-400" />
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Globally Remote</p>
            </div>
          </div>
        </section>

        {/* Custom Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    </PageLayout>
  );
}
