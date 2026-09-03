"use client"

import Link from "next/link";
import { MoveLeft, Home, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export default function NotFound() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="relative z-10 text-center">
        {/* Glitch Effect 404 */}
        <div className="relative inline-block mb-8">
          <h1 className="text-9xl font-mono font-black text-white tracking-widest relative">
            <span className="absolute inset-0 text-fuchsia-500 animate-[glitch-1_2s_infinite_linear_alternate-reverse] opacity-50" aria-hidden="true">404</span>
            404
            <span className="absolute inset-0 text-cyan-500 animate-[glitch-2_3s_infinite_linear_alternate-reverse] opacity-50" aria-hidden="true">404</span>
          </h1>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
          This page got lost on the Botchain
        </h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto leading-relaxed">
          The coordinates you followed don't exist in our current ledger. You might have hit a broken link or an invalid address.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/" 
            className="w-full sm:w-auto btn-primary h-12 px-8 font-bold gap-2 text-[14px]"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          
          {session ? (
            <Link 
              href={session.user.role === 'employer' ? '/employer/dashboard' : '/employee/portal'}
              className="w-full sm:w-auto btn-secondary h-12 px-8 font-bold gap-2 text-[14px]"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/login"
              className="w-full sm:w-auto btn-secondary h-12 px-8 font-bold gap-2 text-[14px]"
            >
              <MoveLeft className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 10% 0); transform: translate(-2px, 2px); }
          20% { clip-path: inset(5% 0 70% 0); transform: translate(2px, -2px); }
          40% { clip-path: inset(40% 0 40% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(70% 0 5% 0); transform: translate(-2px, 2px); }
          100% { clip-path: inset(30% 0 30% 0); transform: translate(2px, -2px); }
        }
        @keyframes glitch-2 {
          0% { clip-path: inset(10% 0 70% 0); transform: translate(2px, -2px); }
          20% { clip-path: inset(40% 0 10% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(5% 0 50% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(60% 0 30% 0); transform: translate(-2px, 2px); }
          80% { clip-path: inset(15% 0 60% 0); transform: translate(2px, -2px); }
          100% { clip-path: inset(50% 0 5% 0); transform: translate(-2px, 2px); }
        }
      `}} />
    </div>
  );
}
