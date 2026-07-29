"use client";

import { useState } from "react";
import { 
  Building2, 
  Globe, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  Save, 
  RefreshCcw,
  Copy,
  ExternalLink,
  Wallet,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/contexts/ToastContext";
import { useOrg } from "@/lib/context/OrgContext";
import DashboardSkeleton from "@/components/DashboardSkeleton";

export default function OrganisationSettingsPage() {
  const { addToast } = useToast();
  const { activeOrg: currentOrg, loading: isLoading } = useOrg();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentOrg?.name || "",
    website: "https://payslip.io",
    email: "ops@company.com",
    industry: "Financial Technology",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      addToast("Organisation profile updated", "success");
    }, 1000);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="pb-8 border-b border-white/5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Building2 className="h-8 w-8 text-indigo-400" />
          Organisation Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your company's global identity on the Robinhood Chain.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <section className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block pl-1">Organisation Name</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white/[0.03] border-white/10 h-11 focus-visible:ring-indigo-500/50" 
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block pl-1">Primary Website</label>
                <Input 
                   value={formData.website}
                   onChange={(e) => setFormData({...formData, website: e.target.value})}
                   className="bg-white/[0.03] border-white/10 h-11 focus-visible:ring-indigo-500/50" 
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block pl-1">Admin Email</label>
                <Input 
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="bg-white/[0.03] border-white/10 h-11 focus-visible:ring-indigo-500/50" 
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block pl-1">Industry</label>
                <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 h-11 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer appearance-none">
                   <option>Financial Technology</option>
                   <option>Software as a Service</option>
                   <option>Digital Marketing</option>
                   <option>Creative Agency</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
               <Button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="btn-primary px-8 h-12 font-bold shadow-indigo-500/20"
               >
                 {isSaving ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                 Save Profile Changes
               </Button>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                 <Wallet className="h-5 w-5 text-indigo-400" />
                 Network Configuration
              </h3>
              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-2 py-0 font-bold uppercase text-[10px]">Active</Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block pl-1">Robinhood Chain Public Identity</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-[13px] text-indigo-300 overflow-hidden text-ellipsis">
                    {currentOrg?.walletAddress || "No wallet linked"}
                  </div>
                  <Button variant="outline" size="icon" className="h-11 w-11 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="p-8 rounded-[32px] bg-red-500/[0.02] border border-red-500/10 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-red-500 tracking-tight flex items-center gap-2">
                 <Trash2 className="h-5 w-5" />
                 Danger Zone
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Irreversible actions regarding this organisation</p>
            </div>
            
            <div className="flex items-center justify-between p-6 rounded-2xl bg-red-500/[0.03] border border-red-500/10">
               <div>
                  <div className="font-bold text-white">Delete Organisation</div>
                  <p className="text-[11px] text-muted-foreground">This will wipe all records and access keys locally.</p>
               </div>
               <Button className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold px-6">
                 Delete
               </Button>
            </div>
          </section>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <ShieldCheck className="h-8 w-8 text-indigo-400 mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Verified Profile</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your organisation identity is linked to your Robinhood Chain account. This ensures all payroll events are cryptographically signed by your domain.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 space-y-4">
             <h4 className="text-sm font-bold text-white uppercase tracking-widest">Metadata Support</h4>
             <ul className="space-y-3">
                {[
                  { label: "Invite Flow", status: "Active" },
                  { label: "On-Chain Audit", status: "Active" },
                  { label: "SSO (SAML)", status: "Pro" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={`font-bold ${item.status === 'Pro' ? 'text-indigo-400' : 'text-cyan-400'}`}>{item.status}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
