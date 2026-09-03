"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import {
  LayoutDashboard,
  Users,
  Coins,
  FileText,
  Activity,
  Settings,
  Home,
  LogOut,
} from "lucide-react";
import { getConnectedAddress, getWalletBalance, NATIVE_SYMBOL } from "@/lib/chain";
import { ACTIVE_CHAIN } from "@/lib/chains";

/**
 * Every entry points at a real route. These used to be plain <button>s with no
 * handler and a hardcoded `active` flag, so the whole sidebar was inert and the
 * other employer pages were unreachable.
 */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/employer/dashboard", color: "#6366f1" },
  { icon: Users, label: "Employees", href: "/employer/employees", color: "#8b5cf6" },
  { icon: Coins, label: "Payroll", href: "/employer/payroll", color: "#06b6d4" },
  { icon: FileText, label: "History", href: "/employer/history", color: "#10b981" },
  { icon: Activity, label: "Analytics", href: "/employer/analytics", color: "#0ea5e9" },
  { icon: Settings, label: "Settings", href: "/employer/settings/account", color: "#f59e0b" },
];

export default function EmployerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    // Non-prompting: never pop the wallet open just to render a sidebar.
    getConnectedAddress().then(async (addr) => {
      if (addr) setBalance(await getWalletBalance(addr));
    });
  }, []);

  const lastLoginText = session?.user?.lastLogin
    ? formatDistanceToNow(new Date((session.user as any).lastLogin), { addSuffix: true })
    : "First login";

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#0f0f2e] border-r border-white/[0.06] text-foreground transition-all duration-300 relative z-20">
      <div className="px-6 py-8 border-b border-white/[0.06]">
        <Link href="/" className="block group">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">PaySlip</h1>
          <p className="text-[11px] text-textMuted font-medium uppercase tracking-widest mt-1">
            Payroll on Botchain
          </p>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href, color }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              href={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group relative ${
                active
                  ? "text-foreground"
                  : "text-textMuted hover:text-foreground hover:bg-white/[0.04]"
              }`}
              style={{ backgroundColor: active ? `${color}14` : undefined }}
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
            </Link>
          );
        })}

        <div className="pt-2 mt-2 border-t border-white/[0.06] space-y-1">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-textMuted hover:text-foreground hover:bg-white/[0.04] transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            <span>Homepage</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-textMuted hover:text-rose-400 hover:bg-rose-500/[0.06] transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </nav>

      <div className="p-5 border-t border-white/[0.06] bg-black/20 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-textHint uppercase tracking-wider">
            Available Balance
          </p>
          <p className="text-lg font-bold gradient-text-2 font-mono truncate">
            {balance ?? "0.00"} {NATIVE_SYMBOL}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="px-2.5 py-1 rounded-full bg-sky/15 border border-sky/20">
            <span className="text-[9px] font-black text-sky uppercase tracking-tighter">
              {ACTIVE_CHAIN.name}
            </span>
          </div>
          <span className="text-[10px] text-textHint font-medium">{lastLoginText}</span>
        </div>
      </div>
    </aside>
  );
}
