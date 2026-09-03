"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  Globe,
  Flame,
  ArrowRight
} from "lucide-react";
import DashboardSkeleton from "@/components/DashboardSkeleton";

const MONTHLY_DATA = [
  { name: 'Jan', eth: 4000, usdc: 2400 },
  { name: 'Feb', eth: 3000, usdc: 1398 },
  { name: 'Mar', eth: 2000, usdc: 9800 },
  { name: 'Apr', eth: 2780, usdc: 3908 },
  { name: 'May', eth: 1890, usdc: 4800 },
  { name: 'Jun', eth: 2390, usdc: 3800 },
  { name: 'Jul', eth: 3490, usdc: 4300 },
];

const ASSET_DATA = [
  { name: 'USDC', value: 65 },
  { name: 'ETH', value: 35 },
];

const EMPLOYEE_DATA = [
  { name: 'Jane Doe', amount: 5200 },
  { name: 'John Smith', amount: 3500 },
  { name: 'Alice Wang', amount: 7000 },
  { name: 'Bob Miller', amount: 4500 },
  { name: 'Charlie Brown', amount: 2000 },
];

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#d946ef', '#f59e0b'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <PieChartIcon className="h-8 w-8 text-cyan-400" />
            Financial Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">Real-time insights across your on-chain payroll ecosystem.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs font-bold">
           <Activity className="h-4 w-4 animate-pulse" />
           Live Network Tracking
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Avg Payment", val: "$4,200", trend: "+12.5%", icon: DollarSign, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Active Recipients", val: "48", trend: "+2", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "On-Chain Volume", val: "152k", trend: "+4.2k", icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Global Nodes", val: "12", trend: "0", icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map((s, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-2">{s.val}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
               <ArrowUpRight className="h-3 w-3" />
               {s.trend} <span className="text-muted-foreground font-medium ml-1">v. last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Payroll Volume Area Chart */}
        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                 <TrendingUp className="h-5 w-5 text-indigo-400" />
                 Total Disbursements
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Volume tracking across ETH and USDC liquidity pools.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-lg border border-white/10">
               <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">ETH</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={12} 
                   tickLine={false} 
                  axisLine={false}
                   tickFormatter={(v) => `$${v}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="eth" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Bar Chart */}
        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                 <Users className="h-5 w-5 text-violet-400" />
                 Top Recipients
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Cumulative payroll allocation per talent account.</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EMPLOYEE_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" stroke="#ffffff20" fontSize={10} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#ffffff60" 
                  fontSize={11} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                  {EMPLOYEE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pie Split */}
        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 h-full flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center mb-8">Asset Allocation</h3>
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ASSET_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {ASSET_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="text-2xl font-black text-white">65%</div>
                 <div className="text-[10px] font-bold text-cyan-400">USDC dominant</div>
              </div>
            </div>
            <div className="flex gap-6 mt-8">
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                  <span className="text-xs font-bold text-slate-300">USDC</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                  <span className="text-xs font-bold text-slate-300">ETH</span>
               </div>
            </div>
        </div>

        {/* Pro Tip Banner */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-white/5 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-fuchsia-400 font-black text-xs uppercase tracking-[0.2em] mb-6">
               <Flame className="h-4 w-4" />
               Smart Insight
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tighter leading-tight">
               Your organisation saved <span className="text-cyan-400">$3,420</span> in settlement fees this quarter using Botchain.
            </h3>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-8">
               By bypassing traditional bank rails, PaySlip reduced your cross-border friction from 3.5% to <span className="font-bold text-white">0.05%</span>.
            </p>
            <button className="w-fit flex items-center gap-2 text-indigo-400 font-bold hover:text-white transition-colors group">
               Schedule full quarterly report
               <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
}
