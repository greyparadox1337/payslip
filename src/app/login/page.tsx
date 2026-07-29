"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { connectInjectedWallet } from "@/lib/chain";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle, ShieldAlert, Wallet } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();
  const { addToast } = useToast();

  const [activeRole, setActiveRole] = useState<"employer" | "employee">("employer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState<number>(0); // in seconds
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else if (session?.user?.role === "employer") {
        router.push("/employer/dashboard");
      } else if (session?.user?.role === "employee") {
        router.push("/employee/portal");
      }
    }
  }, [status, router, searchParams, session]);

  // Countdown timer for locked accounts
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && lockTimeLeft > 0) {
      timer = setInterval(() => {
        setLockTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (lockTimeLeft === 0 && isLocked) {
      setIsLocked(false);
      setErrorMsg("");
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimeLeft]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setIsLocked(false);
    setLockTimeLeft(0);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        rememberMe: rememberMe ? "true" : "false"
      });

      if (result?.error) {
        setShake(true);
        setTimeout(() => setShake(false), 500);

        if (result.error.includes("Account locked")) {
          setIsLocked(true);
          setErrorMsg(result.error);
          // Extract minutes from "Account locked. Try again in X minutes."
          const match = result.error.match(/in (\d+) minutes/);
          if (match && match[1]) {
            setLockTimeLeft(parseInt(match[1]) * 60);
          } else {
            setLockTimeLeft(900); // fallback to 15 mins
          }
        } else {
          setErrorMsg("Invalid email or password");
        }
      } else if (result?.ok) {
        addToast("Signed in successfully", "success");
      }
    } catch (_err) {
      addToast("Network execution error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLockTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleWalletLogin = async () => {
    setIsSubmitting(true);
    try {
      const { address } = await connectInjectedWallet();
      if (!address) throw new Error("Wallet not linked.");
      
      const res = await fetch("/api/auth/wallet-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address })
      });
      const data = await res.json();
      
      if (!res.ok) {
        addToast(data.error || "No employee account found for this wallet", "error");
        setIsSubmitting(false);
        return;
      }
      
      const loginRes = await signIn("credentials", {
        redirect: false,
        walletToken: data.token,
      });

      if (loginRes?.error) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        addToast("Wallet authorization failed", "error");
      } else {
        addToast("Signed in securely!", "success");
      }
    } catch (_err) {
      addToast("MetaMask not installed or mapping failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    addToast("Please contact your system administrator", "info");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background generic grid mapping */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#6366f10a_1px,transparent_1px),linear-gradient(to_bottom,#6366f10a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className={`relative z-10 w-full max-w-md bg-card border border-border/20 shadow-2xl rounded-2xl overflow-hidden transition-transform duration-300 ${shake ? "translate-x-[-8px] animate-[shake_0.4s_ease-in-out_both]" : ""}`}>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}} />

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your PaySlip account</p>
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-border/20">
            <button
              onClick={() => setActiveRole("employer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeRole === "employer" 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              Employer
            </button>
            <button
              onClick={() => setActiveRole("employee")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeRole === "employee" 
                  ? "bg-cyan-400 text-slate-900 shadow-md shadow-cyan-400/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              Employee
            </button>
          </div>

          {isLocked && (
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border-l-4 border-amber-500 flex items-start gap-3 fade-in zoom-in duration-300 animate-in">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-amber-500">Authentication Blocked</p>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded text-amber-500 animate-pulse">
                    {formatLockTime(lockTimeLeft)}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-amber-500/80 mt-0.5">Too many failed attempts. Security lock engaged.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                type="email" 
                placeholder="Email address"
                required
                className={`pl-10 h-11 bg-background/50 border-border/20 focus-visible:ring-1 ${activeRole === 'employer' ? 'focus-visible:ring-primary' : 'focus-visible:ring-cyan-400'}`} 
              />
            </div>
            
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  required
                  className={`pl-10 pr-10 h-11 bg-background/50 border-border/20 focus-visible:ring-1 ${activeRole === 'employer' ? 'focus-visible:ring-primary' : 'focus-visible:ring-cyan-400'} ${errorMsg && !isLocked ? 'border-red-500/50 focus-visible:ring-red-500' : ''}`} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errorMsg && !isLocked && (
                <p className="text-red-400 text-[12px] font-medium mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(c) => setRememberMe(c as boolean)}
                className={`border-border/40 data-[state=checked]:bg-${activeRole === 'employer' ? 'primary' : 'cyan-400'} data-[state=checked]:border-${activeRole === 'employer' ? 'primary' : 'cyan-400'}`}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Stay signed in for 30 days
              </label>
            </div>

            <Button 
              disabled={isSubmitting || isLocked}
              type="submit" 
              className={`w-full h-11 font-medium mt-2 text-[15px] transition-all shadow-lg text-white ${
                activeRole === 'employer' 
                  ? 'bg-primary hover:bg-primary/90 shadow-primary/20' 
                  : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-400/20 text-slate-900 border border-cyan-400/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Attempting Login...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {activeRole === "employee" && (
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/20"></div>
                </div>
                <div className="relative flex justify-center text-[12px] uppercase font-bold tracking-wider">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button 
                onClick={handleWalletLogin} 
                disabled={isSubmitting || isLocked}
                className="w-full flex items-center justify-center gap-2 h-11 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 font-semibold transition-all shadow-sm bg-transparent"
              >
                <Wallet className="h-4 w-4" />
                Sign in with MetaMask wallet
              </Button>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center space-y-3">
            <button onClick={handleForgotPassword} className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </button>
            <p className="text-[13px] text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className={`font-semibold hover:underline transition-colors ${activeRole === 'employer' ? 'text-primary' : 'text-cyan-400'}`}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
