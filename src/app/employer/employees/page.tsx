"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Wallet, 
  Mail, 
  DollarSign, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/contexts/ToastContext";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { PayrollTracker } from "@/components/PayrollTracker";

interface Employee {
  _id: string;
  name: string;
  email?: string;
  walletAddress: string;
  salary: number;
  currency: "ETH" | "USDC";
  status: "active" | "pending" | "inactive";
  createdAt: string;
}

export default function EmployeesPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    walletAddress: "",
    salary: "",
    currency: "ETH" as "ETH" | "USDC"
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      addToast("Failed to sync employee directory", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee)
      });
      
      if (res.ok) {
        addToast(`${newEmployee.name} added to payroll`, "success");
        setIsAddModalOpen(false);
        setNewEmployee({ name: "", email: "", walletAddress: "", salary: "", currency: "ETH" });
        fetchEmployees();
      } else {
        const d = await res.json();
        addToast(d.error || "Failed to add employee", "error");
      }
    } catch (err) {
      addToast("Network synchronization failure", "error");
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading && employees.length === 0) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-violet-400" />
            Employee Directory
          </h1>
          <p className="text-muted-foreground mt-1">Manage your team and their on-chain compensation</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary gap-2 h-12 px-6 shadow-violet-500/20"
        >
          <Plus className="h-5 w-5" />
          Add Employee
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or G-address..." 
            className="pl-10 bg-white/[0.02] border-white/10 h-11 focus-visible:ring-violet-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-white/[0.02] border border-white/10 rounded-xl px-4 h-11 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="text-white font-bold h-14">Employee</TableHead>
              <TableHead className="text-white font-bold h-14">Wallet Address</TableHead>
              <TableHead className="text-white font-bold h-14">Salary (Monthly)</TableHead>
              <TableHead className="text-white font-bold h-14">Status</TableHead>
              <TableHead className="text-white font-bold h-14 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-muted-foreground font-medium">No employees found matching your criteria</p>
                    <Button variant="ghost" onClick={() => {setSearchTerm(""); setFilterStatus("all")}} className="text-violet-400 hover:text-violet-300">
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp._id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-violet-300 transition-colors">{emp.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {emp.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[13px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3 w-3 text-muted-foreground" />
                      {emp.walletAddress.substring(0, 6)}...{emp.walletAddress.substring(50)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-cyan-400" />
                      {emp.salary.toLocaleString()} <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground">{emp.currency}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`
                      gap-1.5 font-bold tracking-tight py-1
                      ${emp.status === 'active' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                        emp.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'}
                    `}>
                      {emp.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : 
                       emp.status === 'pending' ? <Clock className="h-3 w-3" /> : 
                       <AlertCircle className="h-3 w-3" />}
                      {emp.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Employee Modal (Simplified simulation for hackathon UI) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  <Plus className="h-6 w-6 text-violet-400" />
                  Scale your team
                </h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block pl-1">Full Name</label>
                    <Input 
                      required
                      placeholder="Jane Doe" 
                      className="bg-white/[0.03] border-white/10 h-12 focus-visible:ring-violet-500/50"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block pl-1">Email (Optional)</label>
                      <Input 
                        type="email"
                        placeholder="jane@company.com" 
                        className="bg-white/[0.03] border-white/10 h-12 focus-visible:ring-violet-500/50"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block pl-1">Monthly Salary</label>
                      <Input 
                        required
                        type="number"
                        placeholder="5000" 
                        className="bg-white/[0.03] border-white/10 h-12 focus-visible:ring-violet-500/50"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block pl-1">Botchain Wallet Address</label>
                    <Input 
                      required
                      placeholder="0x…" 
                      className="bg-white/[0.03] border-white/10 h-12 font-mono text-sm focus-visible:ring-violet-500/50"
                      value={newEmployee.walletAddress}
                      onChange={(e) => setNewEmployee({...newEmployee, walletAddress: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block pl-1">Preferred Asset</label>
                    <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/10">
                      {["ETH", "USDC"].map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setNewEmployee({...newEmployee, currency: curr as any})}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newEmployee.currency === curr ? 'bg-violet-500 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" className="w-full btn-primary h-14 font-black shadow-violet-500/30">
                    <Zap className="h-5 w-5 mr-2" />
                    Onboard Professional
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
