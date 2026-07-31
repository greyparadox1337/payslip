"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import bcrypt from "bcryptjs";

export default function JoinClientFlow({ token, name, email }: { token: string; name: string; email: string }) {
  const router = useRouter();
  const { addToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    if (password !== confirm) {
      addToast("Passwords do not match", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Failed to complete join", "error");
        return;
      }
      // Auto sign‑in using credentials (email + password)
      const signInRes = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (signInRes.ok) {
        addToast("Account ready! Redirecting…", "success");
        router.push("/employee/portal");
      } else {
        addToast("Login after join failed", "error");
      }
    } catch (err) {
      addToast("Network error during join", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border/20 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-foreground text-center">Complete Your Account</h2>
        <p className="text-muted-foreground text-center text-sm">Welcome, {name}. Please set a password to finish onboarding.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-muted-foreground text-sm mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              required
            />
          </div>
          <div>
            <label className="block text-muted-foreground text-sm mb-1">Confirm Password</label>
            <Input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white">
            {isSubmitting ? "Creating…" : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
