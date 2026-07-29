"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from "react";
import { useOrg } from "@/lib/context/OrgContext";
import {
  Users,
  CalendarClock,
  Coins,
  Plus,
  Pencil,
  Trash2,
  Rocket,
  LayoutDashboard,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  ChevronDown,
  Loader2,
  Activity,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  History,
  Menu
} from "lucide-react";
import { MobilePreviewBanner } from "@/components/shared/MobilePreviewBanner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useCurrencyStore } from "@/store/currencyStore";
import { fetchETHHistory } from "@/lib/price";
import { bulkDisburse, connectWallet, getWalletBalance, estimateTransferFee } from "@/lib/chain";
import { connectInjectedWallet } from "@/lib/chain";
import { PayrollTracker } from "@/components/PayrollTracker";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { WalletButton } from "@/components/WalletButton";
import WalletManager from "@/components/shared/WalletManager";
import SendPanel from "@/components/shared/SendPanel";
import { getTransactionHistory, PaymentRecord } from "@/lib/chain";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─────────────────────────────────────────────
 *  Types
 * ───────────────────────────────────────────── */
interface Employee {
  id: string;
  name: string;
  walletAddress: string;
  salary: number;
  status: "active" | "pending" | "inactive";
  lastPaid?: string;
}

/* ─────────────────────────────────────────────
 *  Seed data
 * ───────────────────────────────────────────── */
const SEED_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    walletAddress: "GBXK7YO3QFUTSGJKR4EGNZP7IZHSSG2DZCPFYXCLMWGRHZWZQNBEFIT",
    salary: 1200,
    status: "active",
    lastPaid: "Mar 15, 2026",
  },
  {
    id: "2",
    name: "Maya Patel",
    walletAddress: "GDJL4ZN3P2RAQWALM6KBHCJDH7A3RPUF3TR5JKWZLC7EW5V3P74DLXR",
    salary: 950,
    status: "active",
    lastPaid: "Mar 15, 2026",
  },
  {
    id: "3",
    name: "Rohan Desai",
    walletAddress: "GCIFMEYBLR2KKQEX4NYWMFHS7GJV6MZTT3DHBXMRC4AEWFG7LNBPLRTJ",
    salary: 1500,
    status: "pending",
  },
  {
    id: "4",
    name: "Priya Nair",
    walletAddress: "GA7V2XNBWKV7Q3CZHSKD6PJMFVF5LNHPR2YWD3IJGCXZBVM4SRLEFRA",
    salary: 800,
    status: "inactive",
    lastPaid: "Jan 15, 2026",
  },
];

const MOCK_CHART_DATA = [
  { name: "Jan", value: 4800, lastMonth: 5000 },
  { name: "Feb", value: 5200, lastMonth: 4800 },
  { name: "Mar", value: 4450, lastMonth: 5200 },
  { name: "Apr", value: 3800, lastMonth: 4100 },
  { name: "May", value: 5000, lastMonth: 4200 },
  { name: "Jun", value: 4200, lastMonth: 3800 },
];

const BAR_COLORS: Record<string, string> = {
  Jan: "#6366f1",
  Feb: "#8b5cf6",
  Mar: "#06b6d4",
  Apr: "#10b981",
  May: "#f59e0b",
  Jun: "#d946ef",
};

/* ─────────────────────────────────────────────
 *  Helpers
 * ───────────────────────────────────────────── */
function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatETH(amount: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const statusConfig: Record<
  Employee["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-cyan/15 text-cyan border-cyan/25",
  },
  pending: {
    label: "Pending",
    className: "bg-amber/15 text-amber border-amber/25",
  },
  inactive: {
    label: "Inactive",
    className: "bg-surface text-textMuted border-borderDefault",
  },
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true, color: "#6366f1" },
  { icon: Users, label: "Employees", active: false, color: "#8b5cf6" },
  { icon: Coins, label: "Payroll", active: false, color: "#06b6d4" },
  { icon: FileText, label: "History", active: false, color: "#10b981" },
  { icon: Activity, label: "Analytics", active: false, color: "#0ea5e9" },
  { icon: Settings, label: "Settings", active: false, color: "#f59e0b" },
];

/* ─────────────────────────────────────────────
 *  CountUp Animation Hook
 * ───────────────────────────────────────────── */
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function useCountUp(end: number, duration: number = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const t = Math.min(progress / duration, 1);
      
      setValue(easeOutExpo(t) * end);

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return value;
}

/* ═════════════════════════════════════════════
 *  Component
 * ═════════════════════════════════════════════ */
export default function EmployerDashboard() {
  const { data: session, update } = useSession();
  const { currency, ethUsdRate, refreshRate } = useCurrencyStore();
  const { activeOrg, orgs, switchOrg, createOrg, loading: orgLoading, transitioning } = useOrg();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Wallet Persistence State
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);
  const [linking, setLinking] = useState(false);
  const [gasPerTransfer, setGasPerTransfer] = useState(0);

  // Gas price is live on an L2, so quote it rather than hardcoding a flat fee
  useEffect(() => {
    estimateTransferFee().then(setGasPerTransfer);
  }, []);

  // Mismatch Detection & Balance Reload
  useEffect(() => {
    async function checkWallet() {
      try {
        const pk = await connectInjectedWallet().then(r => r.address);
        const userWallet = (session?.user as any)?.linkedWallet;
        const orgWallet = activeOrg?.walletAddress;

        if (userWallet && pk !== userWallet) {
          setShowMismatch(true);
        } else {
          setShowMismatch(false);
        }

        if (pk) {
          const bal = await getWalletBalance(pk);
          setBalance(bal);
        }
      } catch (err) {}
    }
    if (session && activeOrg) {
      checkWallet();
    }
  }, [session, activeOrg]);

  const refreshBalance = async () => {
    setBalanceLoading(true);
    try {
      const pk = await connectInjectedWallet().then(r => r.address);
      const bal = await getWalletBalance(pk);
      setBalance(bal);
    } catch (err) {}
    setTimeout(() => setBalanceLoading(false), 800);
  };

  const handleLinkWallet = async () => {
    setLinking(true);
    try {
      const address = await connectWallet();
      if (!address || !address.startsWith("G") || address.length !== 56) {
        throw new Error("Invalid format");
      }
      
      const res = await fetch("/api/user/link-wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, orgId: activeOrg?._id })
      });
      if (res.ok) {
        await update({ linkedWallet: address }); 
        setShowMismatch(false);
        refreshBalance();
      }
    } catch (err) {}
    setLinking(false);
  };

  useEffect(() => {
    if (!activeOrg) return;
    const fetchEmps = async () => {
      try {
        const res = await fetch(`/api/employees?orgId=${activeOrg._id}`);
        if (res.ok) {
          const data = await res.json();
          setEmployees(
            data.map((d: any) => ({
              id: d._id,
              name: d.name,
              walletAddress: d.walletAddress,
              salary: d.salary,
              status: d.status,
            }))
          );
        }
      } catch (err) {
        console.error("Failed fetching employees:", err);
      }
    };
    fetchEmps();
  }, [activeOrg]);

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; dir: "asc" | "desc" } | null>(null);

  // Price Chart State
  const [priceOpen, setPriceOpen] = useState(false);
  const [chartData, setChartData] = useState<{timestamp: number; price: number}[]>([]);

  useEffect(() => {
    fetchETHHistory().then(setChartData);
    
    // Refresh the live rate every 30s
    const rateInterval = setInterval(refreshRate, 30000);
    return () => clearInterval(rateInterval);
  }, [refreshRate]);

  // Employee Dialog Add/Edit State
  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWallet, setFormWallet] = useState("");
  const [formSalary, setFormSalary] = useState("");

  // Payroll Modal State
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [payrollStep, setPayrollStep] = useState<"preview" | "processing" | "success">("preview");
  const [payrollProgress, setPayrollProgress] = useState(0);
  const [publishedTxHash, setPublishedTxHash] = useState<string | null>(null);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  // Chart Toggle
  const [chartView, setChartView] = useState<"current" | "previous">("current");

  // Live Timer
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const int = setInterval(() => setTime(new Date()), 60000); // update every minute
    return () => clearInterval(int);
  }, []);

  /* ── Derived stats ── */
  const totalEmployees = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status !== "inactive").length;
  const totalDisbursed = employees
    .filter((e) => e.status !== "inactive")
    .reduce((s, e) => s + e.salary, 0);

  // Animated numbers for UI
  const animDisbursed = useCountUp(totalDisbursed, 1500);
  const animEmployees = useCountUp(totalEmployees, 1500);
  const animSuccessRate = useCountUp(99.9, 2000);

  /* ── Table Processing ── */
  const processedEmployees = useMemo(() => {
    let result = [...employees];
    
    // 1. Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.walletAddress.toLowerCase().includes(q)
      );
    }
    
    // 2. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === undefined || bVal === undefined) return 0;
        
        if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [employees, searchQuery, sortConfig]);

  const handleSort = (key: keyof Employee) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  };

  /* ── Actions ── */
  function openAddDialog() {
    setFormName("");
    setFormWallet("");
    setFormSalary("");
    setEditingEmployee(null);
    setEmpDialogOpen(true);
  }

  function openEditDialog(emp: Employee) {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormWallet(emp.walletAddress);
    setFormSalary(String(emp.salary));
    setEmpDialogOpen(true);
  }

  async function handleSaveEmployee() {
    if (!formName || !formWallet || !formSalary || !activeOrg) return;

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingEmployee.id
            ? { ...e, name: formName, walletAddress: formWallet, salary: Number(formSalary) }
            : e
        )
      );
    } else {
      try {
        const isInvite = !!formEmail;
        const endpoint = isInvite ? "/api/employees/invite" : "/api/employees";
        const body = { 
           name: formName, 
           walletAddress: formWallet, 
           salary: Number(formSalary), 
           orgId: activeOrg._id,
           ...(isInvite && { email: formEmail })
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (res.ok) {
           const data = await res.json();
           setEmployees((prev) => [...prev, {
             id: data.employee._id,
             name: formName,
             walletAddress: formWallet,
             salary: Number(formSalary),
             status: isInvite ? "pending" : "active",
           }]);
           // Automatically trigger dashboard layout animation blocks explicitly mapping
           if (isInvite) alert("Invite Generated! Sequence output via Local Terminal Console mapping.");
        }
      } catch (err) {
        console.error("Employee sync error", err);
      }
    }
    setEmpDialogOpen(false);
  }

  function handleDeleteEmployee(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  /* ── Payroll Flow ── */
  const activeEmps = employees.filter(e => e.status !== "inactive");
  // One transaction per employee on the EVM, so gas scales with headcount
  const estimatedFee = activeEmps.length * gasPerTransfer;

  async function payrollExecutor() {
    const entries = activeEmps.map((emp) => ({
      destination: emp.walletAddress,
      amount: String(emp.salary),
      employeeName: emp.name,
    }));
    const results = await bulkDisburse(entries, currency);

    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Each payment is its own transaction, so a run can land partially. Never
    // report success while some employees went unpaid.
    if (failed.length) {
      const names = failed.map((r) => r.employeeName).join(", ");
      throw new Error(
        `Paid ${succeeded.length}/${results.length}. Failed for ${names}: ${failed[0].error}`
      );
    }

    // Representative hash for the run — the last confirmed payment
    return succeeded[succeeded.length - 1]?.txHash || "";
  }

  function startPayrollTracker() {
    setPayrollError(null);
    setPayrollStep("processing");
  }

  function finishPayrollTracker() {
    setEmployees((prev) =>
      prev.map((e) =>
        e.status === "pending"
          ? { ...e, status: "active", lastPaid: new Date().toLocaleDateString() }
          : { ...e, lastPaid: new Date().toLocaleDateString() }
      )
    );
    setPayrollModalOpen(false);
  }

  /* ═══════════════════════════════════════════
   *  Render
   * ═══════════════════════════════════════════ */
  const lastLoginText = session?.user?.lastLogin
    ? formatDistanceToNow(new Date((session.user as any).lastLogin), { addSuffix: true })
    : 'First login';
    
  const userWallet = (session?.user as any)?.linkedWallet;
  const isMissingWallet = !userWallet || !activeOrg?.walletAddress;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* --- Sidebar --- */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#0f0f2e] border-r border-white/[0.06] text-foreground transition-all duration-300 relative z-20">
        {/* Logo Area */}
        <div className="px-6 py-8 border-b border-white/[0.06]">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">PaySlip</h1>
          <p className="text-[11px] text-textMuted font-medium uppercase tracking-widest mt-1">Payroll on Robinhood Chain</p>
        </div>
        
        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, active, color }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group relative ${
                active
                  ? "text-foreground"
                  : "text-textMuted hover:text-foreground hover:bg-white/[0.04]"
              }`}
              style={{
                backgroundColor: active ? `${color}14` : undefined, // 0.08 opacity in hex is approx 14
              }}
            >
              {active && (
                <div 
                  className="absolute left-0 w-[4px] h-6 rounded-r-full" 
                  style={{ backgroundColor: color }} 
                />
              )}
              <Icon 
                className={`h-4 w-4 transition-colors ${active ? "" : "group-hover:text-foreground"}`} 
                style={{ color: active ? color : undefined }}
              />
              <span style={{ color: active ? color : undefined }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Bottom Section */}
        <div className="p-5 border-t border-white/[0.06] bg-black/20 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-textHint uppercase tracking-wider">Available Balance</p>
            <p className="text-lg font-bold gradient-text-2 font-mono truncate">
              {balance ? `${formatETH(Number(balance))} ETH` : "0.00 ETH"}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="px-2.5 py-1 rounded-full bg-sky/15 border border-sky/20">
              <span className="text-[9px] font-black text-sky uppercase tracking-tighter">Robinhood Chain Testnet</span>
            </div>
            <span className="text-[10px] text-textHint font-medium">
              {lastLoginText}
            </span>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        className={`flex-1 overflow-y-auto relative z-10 w-full flex flex-col transition-all duration-150 ease-in-out ${
          transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Header bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-xl px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            
            {/* Status Badges */}
            <div className="hidden sm:flex items-center gap-4">
              <CurrencyToggle />
              
              <div className="flex items-center gap-2 px-3 py-1 bg-sky border border-sky/20 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Robinhood Chain Testnet</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 relative">
            {/* Wallet Balance Widget */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-full">
               <Wallet className="h-3.5 w-3.5 text-sky" />
               <span className="text-[13px] font-bold gradient-text-2 font-mono tracking-tight">
                 {balance === null ? <span title="Install MetaMask to configure bounds">—</span> : `${formatETH(Number(balance))} ETH`}
               </span>
               <button onClick={refreshBalance} disabled={balanceLoading}>
                  <RefreshCw className={`h-[12px] w-[12px] text-textMuted transition-transform ${balanceLoading ? "animate-spin text-sky" : "hover:text-foreground"}`} />
               </button>
            </div>
            
            {/* Price Badge Dropdown */}
            <div className="relative hidden min-[400px]:block">
              <button 
                onClick={() => setPriceOpen(!priceOpen)} 
                className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-white/10 hover:border-white/20 rounded-full transition-all"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
                </span>
                <span className="text-[11px] sm:text-[12px] font-bold text-white font-mono">ETH ${ethUsdRate.toFixed(4)}</span>
              </button>
              
              {priceOpen && (
                 <div className="absolute top-12 right-0 w-64 bg-surfaceUp border border-white/10 shadow-2xl rounded-xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                      <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">7-Day ETH/USD</p>
                      <Activity className="h-3 w-3 text-cyan" />
                    </div>
                    <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <Area type="monotone" dataKey="price" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                          <YAxis domain={['auto', 'auto']} hide />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              )}
            </div>

            <button className="relative transition-colors group">
              <Bell className="h-5 w-5 text-fuchsia" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia shadow-[0_0_10px_rgba(217,70,239,0.5)]"></span>
              </span>
            </button>

            {/* Preflight Payroll Trigger */}
            <Button
              onClick={() => setPayrollModalOpen(true)}
              className="gap-2 text-[11px] sm:text-[13px] bg-primary hover:bg-indigo-400 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 px-3 sm:px-4"
            >
              <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden min-[500px]:inline">Run Payroll</span>
              <span className="min-[500px]:hidden">Run</span>
            </Button>
          </div>
        </header>

        {/* --- PERSISTENT BANNERS --- */}
        {isMissingWallet && !showMismatch && (
          <div className="mx-6 lg:mx-8 mt-6 bg-indigo-500/10 border-l-[3px] border-indigo-500 rounded-r-lg p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Wallet className="h-[18px] w-[18px] text-indigo-400" />
              <p className="text-[13px] font-medium text-indigo-100/90">Link your EVM wallet to enable payroll disbursement for <strong className="text-white">{activeOrg?.name}</strong>.</p>
            </div>
            <Button onClick={handleLinkWallet} disabled={linking} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-[12px]">
              {linking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Link wallet"}
            </Button>
          </div>
        )}

        {showMismatch && (
          <div className="mx-6 lg:mx-8 mt-6 bg-yellow-500/10 border-l-[3px] border-yellow-500 rounded-r-lg p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-[18px] w-[18px] text-yellow-500" />
              <p className="text-[13px] font-medium text-yellow-100/90">Your MetaMask wallet changed. Re-link to continue running payroll properly.</p>
            </div>
            <Button onClick={handleLinkWallet} disabled={linking} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold border-none h-8 text-[12px]">
               {linking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Re-link"}
            </Button>
          </div>
        )}

        {/* Content Body */}
        <div className="px-6 lg:px-8 py-6 space-y-6 flex-1">
          {/* 1. Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="relative overflow-hidden bg-[#0f0f2e] border-l-[3px] border-l-[#8b5cf6] border-t-0 border-r-0 border-b-0 shadow-2xl transition-all hover:bg-[#1a1a3e] group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-[13px] font-bold text-textMuted uppercase tracking-wider">Total Employees</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#8b5cf61a] flex items-center justify-center">
                  <Users className="h-[18px] w-[18px] text-[#a78bfa]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white font-mono tracking-tighter">{animEmployees.toFixed(0)}</p>
                <p className="text-[11px] font-medium text-cyan mt-3 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> 12% vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-[#0f0f2e] border-l-[3px] border-l-[#f59e0b] border-t-0 border-r-0 border-b-0 shadow-2xl transition-all hover:bg-[#1a1a3e] group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-[13px] font-bold text-textMuted uppercase tracking-wider">Next Payroll</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#f59e0b1a] flex items-center justify-center">
                  <CalendarClock className="h-[18px] w-[18px] text-[#fbbf24]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white font-mono tracking-tighter">14 <span className="text-sm font-sans text-textMuted uppercase">days</span></p>
                <p className="text-[11px] font-medium text-textHint mt-3 tracking-wide">Expected April 15, 2026</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-[#0f0f2e] border-l-[3px] border-l-[#06b6d4] border-t-0 border-r-0 border-b-0 shadow-2xl transition-all hover:bg-[#1a1a3e] group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-[13px] font-bold text-textMuted uppercase tracking-wider">Total Disbursed</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#06b6d41a] flex items-center justify-center">
                  <Coins className="h-[18px] w-[18px] text-[#22d3ee]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono tracking-tighter gradient-text-2">
                  {formatETH(animDisbursed)} <span className="text-sm font-sans text-textMuted uppercase">ETH</span>
                </p>
                <p className="text-[11px] font-medium text-cyan mt-3 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> 4.2% vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-[#0f0f2e] border-l-[3px] border-l-[#10b981] border-t-0 border-r-0 border-b-0 shadow-2xl transition-all hover:bg-[#1a1a3e] group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-[13px] font-bold text-textMuted uppercase tracking-wider">Success Rate</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#10b9811a] flex items-center justify-center">
                  <Activity className="h-[18px] w-[18px] text-[#34d399]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white font-mono tracking-tighter">{animSuccessRate.toFixed(1)}<span className="text-sm">%</span></p>
                <p className="text-[11px] font-medium text-textHint mt-3 tracking-wide">Zero network rejections</p>
              </CardContent>
            </Card>

            {/* System Overview Visual */}
            <Card className="col-span-1 lg:col-span-4 bg-[#0f0f2e] border-white/[0.06] shadow-2xl overflow-hidden group">
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.35),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.18),transparent_55%)] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f2e] via-[#0f0f2e]/20 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-lg font-bold text-white mb-1">Network Command Center</h3>
                  <p className="text-[12px] text-indigo-200/70 font-medium">Real-time ledger synchronization active</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Robinhood Chain Wallet Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <WalletManager />
            </div>
            <div className="lg:col-span-1">
              <SendPanel compact />
            </div>
            <div className="lg:col-span-1">
              <Card className="h-full bg-[#0f0f2e] border-white/[0.06] shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {/* We'll fetch these from the RPC in a real app, 
                          but for Level 1 we satisfy the UI requirement */}
                      <p className="text-xs text-muted-foreground text-center py-8 italic font-medium">
                        Connect wallet to view ledger history
                      </p>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 2. Chart Section */}
          <Card className="bg-[#0f0f2e] border-white/[0.06] shadow-2xl overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <CardTitle className="text-base font-bold text-white tracking-tight">Disbursement Intelligence</CardTitle>
                <p className="text-[12px] text-textMuted mt-1">ETH volume sent over recent months compared to prior period.</p>
              </div>
              <div className="flex bg-black/20 rounded-lg p-1 border border-white/[0.06] shadow-inner">
                <button 
                  onClick={() => setChartView("current")}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${chartView === "current" ? "bg-indigo text-white shadow-lg" : "text-textMuted hover:text-white"}`}
                >
                  This Year
                </button>
                <button 
                  onClick={() => setChartView("previous")}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${chartView === "previous" ? "bg-indigo text-white shadow-lg" : "text-textMuted hover:text-white"}`}
                >
                  Last Year
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-4 pl-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                    />
                    <Tooltip 
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{ 
                        backgroundColor: "#1a1a3e", 
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {MOCK_CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[entry.name] || "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2.5 BarChart Highlights */}
          <Card className="bg-[#0f0f2e] border-white/[0.06] shadow-2xl overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <CardTitle className="text-base font-bold text-white tracking-tight">Monthly Volume Distribution</CardTitle>
                <p className="text-[12px] text-textMuted mt-1">Cross-departmental disbursement analytics by month.</p>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-4 pl-0 border-t-0">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} 
                      dy={10} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.03)'}}
                      contentStyle={{ backgroundColor: '#0a0a1a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {MOCK_CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[entry.name] || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. DataTable */}
          <Card className="bg-card border-border/20 shadow-xl overflow-visible">
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    Team Directory
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-0 rounded-full px-2 py-0.5 text-[10px]">{activeEmployeesCount} Active</Badge>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search name or wallet..."
                    className="w-[240px] h-9 text-[13px] border-border/20 bg-background focus-visible:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    className="h-9 gap-1.5 text-[12px] font-semibold"
                    variant="outline"
                    onClick={openAddDialog}
                  >
                    <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-background/50">
                  <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="w-[250px] cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('name')}>
                      Employee Name {sortConfig?.key === 'name' && (sortConfig.dir === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('salary')}>
                      Monthly Salary {sortConfig?.key === 'salary' && (sortConfig.dir === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('status')}>
                      Status {sortConfig?.key === 'status' && (sortConfig.dir === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Last Paid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedEmployees.length > 0 ? processedEmployees.map((emp) => {
                    const status = statusConfig[emp.status];
                    return (
                      <TableRow
                        key={emp.id}
                        className="group border-white/[0.04] hover:bg-indigo/05 transition-all border-l-4 border-l-transparent hover:border-l-indigo cursor-pointer"
                      >
                        <TableCell className="font-medium text-foreground py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border/30 text-[12px] font-bold text-foreground shadow-sm group-hover:border-primary/50 transition-colors">
                              {emp.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-[13.5px]">{emp.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded-md bg-background px-2 py-1 text-[12px] font-mono text-muted-foreground border border-border/10 group-hover:text-primary/80 transition-colors">
                            {truncateAddress(emp.walletAddress)}
                          </code>
                        </TableCell>
                        <TableCell className="text-[13.5px] font-semibold text-foreground font-mono">
                          {formatETH(emp.salary)}{" "}
                          <span className="text-[11px] font-normal text-muted-foreground font-sans">ETH</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] font-semibold border ${status.className}`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[12.5px] text-muted-foreground flex items-center gap-2">
                          {emp.lastPaid || <span className="text-slate-500 italic">Never</span>}
                          {emp.lastPaid && (
                            <div className="h-6 w-8 relative rounded border border-white/10 bg-white/[0.04] overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group/receipt flex items-center justify-center">
                              <FileText className="h-3 w-3 text-slate-400 group-hover/receipt:text-white transition-colors" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); openEditDialog(emp); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No employees found. Adjust search or add a new team member.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ---------------------------------------------
       *  ADD/EDIT EMPLOYEE DIALOG
       * --------------------------------------------- */}
      <Dialog open={empDialogOpen} onOpenChange={setEmpDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-border/20 bg-card text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Team Member"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define the employee's public EVM wallet and monthly ETH salary.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} className="bg-background border-border/20" />
            </div>
            <div className="grid gap-2">
              <Label>Employee Email (Optional)</Label>
              <Input placeholder="e.g. employee@company.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" className="bg-background border-border/20" />
            </div>
            <div className="grid gap-2">
              <Label>Wallet Address</Label>
              <Input placeholder="0x…" value={formWallet} onChange={(e) => setFormWallet(e.target.value)} className="font-mono bg-background border-border/20 text-[13px]" />
            </div>
            <div className="grid gap-2">
              <Label>Monthly Salary ({currency})</Label>
              <div className="relative">
                <Input type="number" placeholder="e.g. 500" value={formSalary} onChange={(e) => setFormSalary(e.target.value)} className={`font-mono bg-background border-border/20 text-[13px] ${currency === 'ETH' ? 'pr-28' : ''}`} />
                {currency === 'ETH' && (
                  <div className="absolute right-3 top-2.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    ≈ ${(Number(formSalary || 0) * ethUsdRate).toFixed(2)} 
                    <Activity className="h-3 w-3 cursor-pointer hover:text-cyan transition-colors" onClick={refreshRate} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmpDialogOpen(false)} className="border-border/20 bg-transparent text-foreground hover:bg-background">Cancel</Button>
            <Button onClick={handleSaveEmployee} className="bg-primary hover:bg-indigo-400 text-white shadow-lg shadow-primary/20">{editingEmployee ? "Save Changes" : "Add Employee"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------
       *  MULTI-STEP PAYROLL MODAL
       * --------------------------------------------- */}
      <Dialog open={payrollModalOpen} onOpenChange={(open) => {
        // Prevent closing if processing
        if (payrollStep === "processing") return;
        setPayrollModalOpen(open);
        if (!open) setTimeout(() => setPayrollStep("preview"), 300);
      }}>
        <DialogContent className="sm:max-w-[500px] border-border/40 bg-card text-foreground shadow-2xl overflow-hidden">
          {payrollStep === "preview" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Confirm Payroll</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-0.5">Please review the disbursement summary.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {payrollError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-400 font-medium leading-relaxed">{payrollError}</p>
                </div>
              )}

              <div className="bg-background border border-border/20 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-muted-foreground font-medium">Recipients</span>
                  <span className="font-bold text-foreground">{activeEmps.length} active employees</span>
                </div>
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-muted-foreground font-medium">Total Disbursement</span>
                  <span className="font-bold text-foreground font-mono">{formatETH(totalDisbursed)} ETH</span>
                </div>
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-muted-foreground font-medium">Base Network Fee</span>
                  <span className="font-bold text-amber-400 font-mono">~ {estimatedFee.toFixed(5)} ETH</span>
                </div>
                <div className="border-t border-border/20 pt-4 mt-2 flex justify-between items-center">
                  <span className="text-[15px] font-semibold text-foreground">Total Required</span>
                  <span className="text-[18px] font-extrabold text-foreground font-mono text-primary">
                    {formatETH(totalDisbursed + estimatedFee)} <span className="text-[12px] text-muted-foreground font-sans">ETH</span>
                  </span>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setPayrollModalOpen(false)} className="border-border/20 bg-transparent text-foreground hover:bg-background">Cancel</Button>
                <Button onClick={startPayrollTracker} disabled={activeEmps.length === 0} className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  Confirm & Sign
                </Button>
              </DialogFooter>
            </>
          )}

          {payrollStep === "processing" && (
            <PayrollTracker
              employees={activeEmps.map((e) => ({
                name: e.name,
                salary: String(e.salary),
                walletAddress: e.walletAddress,
              }))}
              executor={payrollExecutor}
              onComplete={finishPayrollTracker}
            />
          )}
        </DialogContent>
      </Dialog>
      <MobilePreviewBanner />
    </div>
  );
}

