"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Filter,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Settings2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/contexts/ToastContext";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { PayrollTracker } from "@/components/PayrollTracker";

interface Employee {
  _id: string;
  name: string;
  walletAddress: string;
  salary: number;
  currency: string;
  status: string;
}

export default function PayrollPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const [payPeriod, setPayPeriod] = useState("Monthly");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      if (res.ok) {
        const data = await res.json();
        const active = data.filter((e: Employee) => e.status === "active");
        setEmployees(active);
        setSelectedIds(active.map((e: Employee) => e._id)); // Default all select
      }
    } catch (_err) {
      addToast("Failed to fetch active payroll list", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map(e => e._id));
    }
  };

  const selectedEmployees = employees.filter(e => selectedIds.includes(e._id));
  const totalETH = selectedEmployees.filter(e => e.currency === 'ETH').reduce((sum, e) => sum + e.salary, 0);
  const totalUSDC = selectedEmployees.filter(e => e.currency === 'USDC').reduce((sum, e) => sum + e.salary, 0);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Zap className="h-8 w-8 text-indigo-400" />
            Payroll Runner
          </h1>
          <p className="text-muted-foreground mt-1">Execute your team's on-chain compensation in seconds.</p>
        </div>
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/10">
          {["Monthly", "Bi-weekly", "Weekly"].map((p) => (
            <button
              key={p}
              onClick={() => setPayPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${payPeriod === p ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-muted-foreground hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Users className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Recipients</div>
            <div className="text-2xl font-black text-white">{selectedIds.length} / {employees.length}</div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Wallet className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Total ETH</div>
            <div className="text-2xl font-black text-white">{totalETH.toLocaleString()} <span className="text-xs text-muted-foreground">ETH</span></div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
            <DollarSign className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Total USDC</div>
            <div className="text-2xl font-black text-white">{totalUSDC.toLocaleString()} <span className="text-xs text-muted-foreground">USDC</span></div>
          </div>
        </div>
      </div>

      {/* Selection Table */}
      <div className="bg-white/[0.01] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                 <Checkbox 
                   id="select-all" 
                   checked={selectedIds.length === employees.length && employees.length > 0} 
                   onCheckedChange={toggleAll}
                   className="h-5 w-5 border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                 />
                 <label htmlFor="select-all" className="text-sm font-bold text-white cursor-pointer select-none">
                    Select for this run
                 </label>
              </div>
           </div>
           <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 border-dashed font-bold px-3 py-1">
              Ready to process {selectedIds.length} payments
           </Badge>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <div className="divide-y divide-white/5">
            {employees.map((emp) => (
              <div key={emp._id} className={`flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors ${selectedIds.includes(emp._id) ? 'bg-white/[0.01]' : 'opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <Checkbox 
                    checked={selectedIds.includes(emp._id)} 
                    onCheckedChange={() => toggleSelect(emp._id)}
                    className="h-5 w-5 border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                  />
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-indigo-300 text-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{emp.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{emp.walletAddress.substring(0,8)}...{emp.walletAddress.substring(50)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-10 text-right">
                  <div>
                    <div className="text-lg font-black text-white">{emp.salary.toLocaleString()}</div>
                    <div className="text-[10px] uppercase font-bold text-indigo-400/80 tracking-widest">{emp.currency}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5">
           <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-cyan-500" />
                Payments are non-custodial and signed via MetaMask
              </div>
              <Button 
                onClick={() => setIsRunning(true)}
                disabled={selectedIds.length === 0}
                className="btn-primary px-10 h-14 font-black shadow-indigo-500/30 gap-3 text-lg group"
              >
                Assemble & Publish Payroll
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
        </div>
      </div>

      {/* History Shortcut */}
      <section className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
               <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
               <h3 className="font-bold text-white">Review past payroll runs</h3>
               <p className="text-xs text-muted-foreground">Analyze your spending and track each ledger settlement.</p>
            </div>
         </div>
         <Button variant="ghost" className="text-indigo-400 hover:text-white hover:bg-white/5 group">
            Open Execution History
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
      </section>

      {/* Payroll Runner Overlay */}
      {isRunning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  <Zap className="h-6 w-6 text-indigo-400" />
                  Network Execution
                </h2>
                <button onClick={() => setIsRunning(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <PayrollTracker 
                employees={selectedEmployees.map(e => ({
                  name: e.name,
                  salary: e.salary.toString(),
                  walletAddress: e.walletAddress
                }))}
                executor={async () => {
                  // Simulate on-chain execution delay
                  await new Promise(r => setTimeout(r, 2000));
                  return "2b9a...1a2b"; // Mock txHash
                }}
                onComplete={() => setIsRunning(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
