"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { connectInjectedWallet, getTransactionHistory, NATIVE_SYMBOL } from "@/lib/chain";
import { Loader2, Link as LinkIcon, Download, Copy, Settings, CheckCircle2, Lock, ShieldAlert, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#3b82f6'];

export default function EmployeeProfile() {
  const { data: session, update } = useSession();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Edit Name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  
  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // States
  const [isLinking, setIsLinking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/employee/profile");
      const data = await res.json();
      if (data.user) {
         setProfile(data.user);
         setEditName(data.user.name);
      }
    } catch(err) {
      addToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarCycle = async () => {
    if (!profile) return;
    const currentIndex = COLORS.indexOf(profile.avatarColor);
    const nextColor = COLORS[(currentIndex + 1) % COLORS.length];

    setProfile({ ...profile, avatarColor: nextColor });
    await fetch("/api/employee/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarColor: nextColor })
    });
  };

  const handleSaveName = async () => {
    setIsEditingName(false);
    if (!editName || editName === profile?.name) return;

    setProfile({ ...profile, name: editName });
    await fetch("/api/employee/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName })
    });
    addToast("Name updated", "success");
    update();
  };

  const handleRelinkWallet = async () => {
    setIsLinking(true);
    try {
      const { address } = await connectInjectedWallet();
      if (!address) throw new Error("Wallet not accessible");
      
      const res = await fetch("/api/user/link-wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, orgId: null }) // orgId not strictly valid here without active bounds, server defaults directly linked Wallet
      });
      
      const data = await res.json();
      if (res.ok) {
         setProfile({ ...profile, linkedWallet: data.linkedWallet });
         addToast("MetaMask wallet successfully updated!", "success");
         update();
      } else {
         addToast(data.error || "Failed linking wallet", "error");
      }
    } catch(err) {
      addToast("MetaMask mapping error", "error");
    } finally {
      setIsLinking(false);
    }
  };

  const handleCopyWallet = () => {
    if (!profile?.linkedWallet) return;
    navigator.clipboard.writeText(profile.linkedWallet);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    addToast("Copied to clipboard", "info");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPwd(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Password change failed");
      
      addToast("Password changed securely", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch(err: any) {
      addToast(err.message, "error");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!profile?.linkedWallet) {
       addToast("You must have an active wallet to download history.", "error");
       return;
    }
    
    setIsDownloading(true);
    try {
      // 1. Read incoming payments for this wallet off Botchain
      const records = await getTransactionHistory(profile.linkedWallet);
      if (records.length === 0) {
        addToast("No transactions found on network history", "info");
        setIsDownloading(false);
        return;
      }

      // 2. Format CSV mapped outputs perfectly
      let csv = "Date,Transaction Hash,Type,Asset,Amount\n";
      records.forEach((tx) => {
         const date = new Date(tx.createdAt).toLocaleString();
         csv += `"${date}",${tx.transactionHash},payment,${NATIVE_SYMBOL},${tx.amount}\n`;
      });

      // 3. Blob Anchor logic structurally executing standard downloads
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip_Export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      addToast("Payslips exported successfully", "success");
    } catch(err: any) {
      addToast("Failed querying Botchain", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-500" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-8 flex items-center border-b border-border/20 bg-card">
         <h1 className="text-[15px] font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-4 w-4 text-cyan-400" /> Settings & Profile
         </h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        
        {/* -- AVATAR & NAME BLOCK -- */}
        <div className="flex items-center gap-6 bg-card border border-border/20 rounded-2xl p-8">
           <button 
             onClick={handleAvatarCycle}
             className="relative h-[80px] w-[80px] rounded-full flex items-center justify-center shadow-2xl transition hover:scale-105 active:scale-95 group overflow-hidden"
             style={{ backgroundColor: profile?.avatarColor || "#6366f1" }}
             title="Click to randomly cycle avatar color"
           >
              <span className="text-3xl font-bold text-white shadow-sm">{profile?.name?.charAt(0)}</span>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Settings className="h-5 w-5 text-white/80" />
              </div>
           </button>

           <div className="flex flex-col gap-1.5 flex-1">
             {isEditingName ? (
               <div className="flex items-center gap-2 max-w-sm">
                 <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 font-bold bg-background text-[15px] border-cyan-500 focus-visible:ring-cyan-500/50" autoFocus />
                 <Button size="sm" onClick={handleSaveName} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 h-9">Save</Button>
               </div>
             ) : (
               <h2 className="text-2xl font-bold text-foreground cursor-pointer hover:text-cyan-400 transition flex items-center gap-2" onClick={() => setIsEditingName(true)} title="Click to edit name">
                 {profile?.name} 
                 <span className="text-[10px] text-muted-foreground uppercase opacity-0 group-hover:opacity-100 hover:opacity-100 tracking-wider">Edit</span>
               </h2>
             )}
             
             <p className="text-[14px] text-muted-foreground flex items-center gap-1.5">
               <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px] font-mono tracking-wide">{profile?.email}</span>
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* -- WALLET CONNECTION BLOCK -- */}
          <div className="bg-card border border-border/20 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-5 w-5 text-cyan-400" />
              <h3 className="text-[16px] font-bold text-foreground tracking-tight">Active Wallet</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-background rounded-lg border border-border/30 p-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Botchain Target</p>
                <div className="flex items-center justify-between">
                  {profile?.linkedWallet ? (
                    <span className="font-mono text-[14px] font-medium text-cyan-400 tracking-tight">
                       {profile.linkedWallet.slice(0,8)}...{profile.linkedWallet.slice(-8)}
                    </span>
                  ) : (
                    <span className="text-[14px] text-red-400/80 italic">Not connected mapping limit</span>
                  )}
                  
                  {profile?.linkedWallet && (
                    <button onClick={handleCopyWallet} className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground transition">
                       {copiedLink ? <Check className="h-4 w-4 text-cyan-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              <Button onClick={handleRelinkWallet} disabled={isLinking} className="w-full h-11 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all font-semibold shadow-inner">
                 {isLinking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : profile?.linkedWallet ? 'Sync Alternate Target' : 'Connect Target'}
              </Button>
            </div>
          </div>


          {/* -- EXPORTS -- */}
          <div className="bg-card border border-border/20 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-cyan-400" />
              <h3 className="text-[16px] font-bold text-foreground tracking-tight">Network Activity</h3>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Export standard network structures downloading transaction sequences securely verified locally directly via testnet historical archives natively scoped over your specific mapped arrays.
            </p>

            <Button onClick={handleDownloadCSV} disabled={isDownloading || !profile?.linkedWallet} className="w-full h-11 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all font-semibold">
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Download Payslips (CSV)'}
            </Button>
          </div>

        </div>

        {/* -- SECURITY -- */}
        <div className="bg-card border border-border/20 rounded-2xl p-8 max-w-xl">
           <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-rose-400" />
              <h3 className="text-[16px] font-bold text-foreground tracking-tight">Security</h3>
           </div>

           <form onSubmit={handlePasswordChange} className="space-y-4">
             <div>
               <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Current Password</label>
               <Input 
                 type="password" required 
                 value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} 
                 className="bg-background border-border/20 focus-visible:ring-rose-500/50" 
               />
             </div>
             <div>
               <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">New Boundary Key</label>
               <Input 
                 type="password" required placeholder="8+ characters limits"
                 value={newPassword} onChange={e => setNewPassword(e.target.value)} 
                 className="bg-background border-border/20 focus-visible:ring-rose-500/50" 
               />
             </div>

             <Button type="submit" disabled={isChangingPwd || newPassword.length < 8} className="h-10 mt-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold px-6 shadow-none">
                {isChangingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Key Mapping'}
             </Button>
           </form>
        </div>

      </main>
    </div>
  );
}
