"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Download, 
  ExternalLink, 
  Calendar, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  Copy
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
import { explorerTxUrl } from '@/lib/chains';

interface HistoryRecord {
  id: string;
  date: string;
  recipient: string;
  amount: string;
  currency: string;
  txHash: string;
  status: "success" | "pending" | "failed";
}

export default function HistoryPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Generate some mock history data for the sweep demo
    setTimeout(() => {
      setHistory([
        { id: "1", date: "Apr 04, 2025", recipient: "Jane Doe", amount: "5,200", currency: "USDC", txHash: "2b9a...1a2b", status: "success" },
        { id: "2", date: "Apr 04, 2025", recipient: "John Smith", amount: "3,500", currency: "ETH", txHash: "4c8f...9d0e", status: "success" },
        { id: "3", date: "Mar 28, 2025", recipient: "Alice Wang", amount: "7,000", currency: "USDC", txHash: "8e2d...4f3a", status: "success" },
        { id: "4", date: "Mar 28, 2025", recipient: "Bob Miller", amount: "4,500", currency: "ETH", txHash: "1a7b...6c9d", status: "success" },
        { id: "5", date: "Mar 15, 2025", recipient: "Charlie Brown", amount: "2,000", currency: "ETH", txHash: "9d1e...3b5a", status: "failed" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleExportCSV = () => {
    addToast("Generating CSV report...", "info");
    const headers = "Date,Recipient,Amount,Currency,TxHash,Status\n";
    const rows = history.map(h => `${h.date},${h.recipient},${h.amount},${h.currency},${h.txHash},${h.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `PaySlip_History_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    addToast("Export complete!", "success");
  };

  const filteredHistory = history.filter(h => 
    h.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.txHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="h-8 w-8 text-amber-500" />
            Execution History
          </h1>
          <p className="text-muted-foreground mt-1">Audit trail of all on-chain disbursements and ledger events.</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          className="btn-secondary gap-2 h-12 px-6 border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
        >
          <Download className="h-5 w-5" />
          Export CSV
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by recipient or Hash..." 
            className="pl-10 bg-white/[0.02] border-white/10 h-11 focus-visible:ring-amber-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 bg-white/[0.02] border-white/10 gap-2 font-bold text-[13px]">
           <Calendar className="h-4 w-4" />
           Select Range
        </Button>
      </div>

      {/* History Table */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="hover:bg-transparent border-white/5 h-14">
              <TableHead className="text-white font-bold">Execution Date</TableHead>
              <TableHead className="text-white font-bold">Recipient</TableHead>
              <TableHead className="text-white font-bold">Volume</TableHead>
              <TableHead className="text-white font-bold">Ledger Hash</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold text-right">Verification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((h) => (
              <TableRow key={h.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                <TableCell className="py-5">
                   <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{h.date}</div>
                   <div className="text-[10px] text-muted-foreground opacity-60">09:42 AM EST</div>
                </TableCell>
                <TableCell className="py-5">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500/50"></div>
                      <span className="font-bold text-white/90">{h.recipient}</span>
                   </div>
                </TableCell>
                <TableCell className="py-5">
                   <div className="font-bold text-white">{h.amount} <span className="text-[10px] text-muted-foreground">{h.currency}</span></div>
                </TableCell>
                <TableCell className="py-5 font-mono text-[11px] text-slate-400">
                   <div className="flex items-center gap-2">
                       <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-white" />
                       {h.txHash}
                   </div>
                </TableCell>
                <TableCell className="py-5">
                   <Badge variant="outline" className={`
                      gap-1.5 font-bold tracking-tight py-1
                      ${h.status === 'success' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                        h.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'}
                    `}>
                      {h.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : 
                       h.status === 'pending' ? <Clock className="h-3 w-3" /> : 
                       <XCircle className="h-3 w-3" />}
                      {h.status.toUpperCase()}
                   </Badge>
                </TableCell>
                <TableCell className="py-5 text-right">
                   <a 
                     href={explorerTxUrl(h.txHash)} 
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 transition-all hover:scale-110"
                   >
                     <ExternalLink className="h-4 w-4" />
                   </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Audit Note */}
      <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
         <FileText className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
         <div>
            <h4 className="text-sm font-bold text-amber-400 mb-1">On-Chain immutability</h4>
            <p className="text-xs text-amber-500/70 leading-relaxed max-w-2xl">
               Every salary disbursement shown here is cryptographically verifiable on the Robinhood Chain Network. These records serve as an official audit trail for your organisation's financial compliance.
            </p>
         </div>
      </div>
    </div>
  );
}
