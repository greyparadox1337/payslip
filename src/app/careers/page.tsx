'use client'

import React from 'react'
import PageLayout from '@/components/PageLayout'
import { Briefcase, MapPin, Clock, DollarSign, Globe, Coins, Zap, Rocket, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

const OPEN_ROLES = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    dept: 'Engineering',
    color: 'indigo',
    details: 'Remote · Full-time · Competitive salary in ETH + USD',
    description: 'Help us build the next generation of global payroll dashboards. You will be responsible for crafting high-performance, accessible, and stunning user interfaces using modern web technologies.',
    skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'],
  },
  {
    id: 'blockchain',
    title: 'Robinhood Chain/Blockchain Developer',
    dept: 'Engineering',
    color: 'cyan',
    details: 'Remote · Part-time or Full-time',
    description: 'Design and implement secure, efficient smart contracts on Robinhood Chain. You will bridge the gap between traditional finance and decentralized on-chain settlements.',
    skills: ['viem', 'Solidity', 'TypeScript', 'Smart Contracts'],
  },
  {
    id: 'design',
    title: 'Product Designer',
    dept: 'Design',
    color: 'fuchsia',
    details: 'Remote · Full-time',
    description: 'Define the visual language and user experience of PaySlip. You will translate complex blockchain workflows into intuitive, human-centered designs that wow our users.',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Motion Design'],
  },
  {
    id: 'growth',
    title: 'Growth & Marketing Lead',
    dept: 'Marketing',
    color: 'amber',
    details: 'Remote · Full-time',
    description: 'Lead our market expansion and ecosystem growth. You will be at the forefront of Web3 marketing, building community around the future of global payroll.',
    skills: ['Web3 Marketing', 'Content', 'SEO', 'Community'],
  },
]

const BENEFITS = [
  { title: 'Paid in ETH', desc: 'Optional crypto salaries via Robinhood Chain.', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { title: 'Remote First', desc: 'Work from anywhere in the world.', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { title: 'Equity', desc: 'Stock options for early employees.', icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { title: 'Move Fast', desc: 'Iterate daily on modern tech stacks.', icon: Zap, color: 'text-sky-400', bg: 'bg-sky-400/10' },
]

export default function CareersPage() {
  return (
    <PageLayout>
      <div className="bg-[#0a0a1a] text-white selection:bg-indigo-500/30 overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.1),_transparent_40%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest mb-8">
              <CheckCircle2 className="h-3 w-3" /> We're hiring
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">
              Build the future <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                of global payroll
              </span>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Remote-first, async-friendly, and obsessed with blockchain technology. Join our mission to modernize payments on the Robinhood Chain.
            </p>
          </div>
        </section>

        {/* OPEN ROLES SECTION */}
        <section className="py-24 px-6 relative">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-12 text-center lg:text-left">Open Positions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {OPEN_ROLES.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-24 px-6 border-t border-white/5 bg-white/5 shadow-inner">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold mb-4">Why work at PaySlip?</h2>
            <p className="text-slate-400 mb-16">The infrastructure for the future of work, built by a global team.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {BENEFITS.map((benefit, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl ${benefit.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  )
}

function RoleCard({ role }: { role: typeof OPEN_ROLES[0] }) {
  const colorMap: Record<string, string> = {
    indigo: 'border-l-indigo-500 text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    cyan: 'border-l-cyan-500 text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    fuchsia: 'border-l-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    amber: 'border-l-amber-500 text-amber-400 bg-amber-400/10 border-amber-500/20',
  }

  const c = colorMap[role.color]

  return (
    <div className={`p-8 rounded-2xl bg-white/5 border border-white/10 border-l-[3px] ${c.split(' ')[0]} hover:border-l-[4px] hover:bg-white/[0.07] transition-all group hover:-translate-y-1 shadow-xl`}>
      <div className="flex items-start justify-between mb-6">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${c.split(' ').slice(1).join(' ')}`}>
          {role.dept}
        </span>
      </div>
      
      <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">{role.title}</h3>
      
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-6">
        <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Remote</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {role.details.split(' · ')[1]}</span>
        <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> {role.id === 'frontend' ? 'ETH + USD' : 'Competitive'}</span>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mb-8 line-clamp-2">
        {role.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {role.skills.map((skill) => (
          <span key={skill} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-medium text-slate-300">
            {skill}
          </span>
        ))}
      </div>

      <a href={`/careers/${role.id}`} className={`inline-flex items-center gap-2 text-sm font-bold ${c.split(' ')[1]} group/link hover:opacity-80 transition-all`}>
        Apply now <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
      </a>
    </div>
  )
}
