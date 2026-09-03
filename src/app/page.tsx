"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PageLayout from "@/components/PageLayout";
import { Activity, Wallet, Users, Zap, Globe, MapPin, Building2, Rocket, Coins, ShieldCheck, ArrowRightLeft, FileDown, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/* ─────────────────────────────────────────────
 *  1) Particle Canvas Background
 * ───────────────────────────────────────────── */
function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const particleCount = 80;
    const connectionDist = 120;
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      radius: number = 0;

      constructor() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 0.5;
      }

      update() {
        if (!canvas) return;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Use a mix of colors: indigo, violet, cyan, cyan
        const colors = ["rgba(99,102,241, 0.4)", "rgba(139,92,246, 0.4)", "rgba(6,182,212, 0.4)", "rgba(16,185,129, 0.4)"];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Opacity scales with distance
            const alpha = 1 - dist / connectionDist;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.3})`; // cyan tint
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  );
}

/* ─────────────────────────────────────────────
 *  2) Typewriter Component
 * ───────────────────────────────────────────── */
function Typewriter({ words }: { words: string[] }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentWord = words[currentWordIndex];
    const typeSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && currentText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      timer = setTimeout(() => {}, 500);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) =>
          isDeleting ? currentWord.substring(0, prev.length - 1) : currentWord.substring(0, prev.length + 1)
        );
      }, typeSpeed);
    }
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <span className="inline-block relative">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary [-webkit-text-fill-color:transparent]">
        {currentText || "\u00A0"}
      </span>
      <span className="absolute -right-3 top-0 bottom-0 w-[3px] bg-primary animate-pulse" />
    </span>
  );
}

// ---------- Hook for count up animation ----------
function useCountUp(target: number, suffix = "", duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const start = () => {
      const startTime = performance.now();
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setValue(Math.floor(target * easeOut(progress)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref, suffix };
}

// ---------- StatCard component ----------
interface StatCardProps {
  icon: React.ElementType;
  borderColor: string;
  gradient: string;
  label: string;
  target: number;
  suffix?: string;
}

function StatCard({ icon: Icon, borderColor, gradient, label, target, suffix = "" }: StatCardProps) {
  const { value, ref } = useCountUp(target, suffix);
  
  // Format long numbers with commas for better readability and to prevent overflow
  const formattedValue = value.toLocaleString();

  return (
    <div ref={ref} className={`bg-surfaceUp p-6 sm:p-8 rounded-[16px] border-l-4 ${borderColor} shadow-lg overflow-hidden`}>
      <div className="flex items-center mb-4">
        <Icon className={`h-6 w-6 ${gradient.split(' ')[0]}`} />
      </div>
      <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent truncate`}>
        {formattedValue}{suffix}
      </h3>
      <p className="text-muted text-xs sm:text-sm mt-2">{label}</p>
    </div>
  );
}

// ---------- Testimonial component ----------
interface TestimonialProps {
  borderColor: string;
  avatar: string;
  name: string;
  role: string;
  quote: string;
}

function Testimonial({ borderColor, avatar, name, role, quote }: TestimonialProps) {
  return (
    <div className={`bg-surfaceUp p-6 rounded-[12px] border-t-4 ${borderColor}`}>
      <p className="italic mb-4">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium text-primary">{avatar}</div>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-muted text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- Section 4 Components ----------

function HowItWorksStep({ step, title, body, icon: Icon, color, tag }: { step: number, title: string, body: string, icon: React.ElementType, color: string, tag: string }) {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-500 border-violet-500/20 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]",
    cyan: "bg-cyan-500 border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  };

  return (
    <div className="relative flex flex-col items-center text-center p-6 group">
      <div className={`w-14 h-14 rounded-full ${colorMap[color].split(" ")[0]} flex items-center justify-center mb-6 z-10 relative`}>
        <span className="text-white font-extrabold text-xl">{step}</span>
        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${colorMap[color].split(" ")[0]}`} />
      </div>
      
      <div className={`mb-6 p-4 rounded-2xl bg-surface border border-white/5 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2`}>
        <Icon className={`h-8 w-8 mb-4 mx-auto ${colorMap[color].split(" ")[2]}`} />
        <h3 className="text-xl font-bold text-textPrimary mb-3">{title}</h3>
        <p className="text-textMuted text-sm leading-relaxed mb-6">{body}</p>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorMap[color].split(" ")[1]} ${colorMap[color].split(" ")[2]} bg-white/5`}>
          {tag}
        </span>
      </div>
    </div>
  );
}

function DashboardMockup() {
  const [hoverArea, setHoverArea] = useState<string | null>(null);

  return (
    <div className="relative mx-auto max-w-5xl group perspective-1000">
      {/* Browser Chrome */}
      <div className="bg-surfaceUp rounded-t-xl border-x border-t border-white/10 p-3 flex items-center gap-2">
        <div className="flex gap-1.5 grayscale group-hover:grayscale-0 transition-all duration-500">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/80" />
        </div>
        <div className="flex-1 max-w-md bg-black/20 rounded-md py-1 px-4 text-[10px] text-textMuted mx-auto border border-white/5 flex items-center gap-2">
          <Globe className="h-3 w-3 opacity-30" />
          app.payslip.xyz/dashboard
        </div>
      </div>
      
      {/* Mockup Inside */}
      <div className="bg-surface border border-white/10 rounded-b-xl shadow-2xl overflow-hidden flex h-[480px] sm:h-[540px] relative">
        {/* Fake Sidebar */}
        <div className="w-16 sm:w-56 border-r border-white/5 bg-surfaceUp/50 p-4 flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2 mb-4">
            <Zap className="h-5 w-5 text-indigo-500" />
            <span className="hidden sm:inline font-bold text-sm tracking-tight">PaySlip</span>
          </div>
          <div className="space-y-1">
            {[
              { icon: Activity, label: "Dashboard", color: "text-indigo-500", active: true },
              { icon: Users, label: "Employees", color: "text-violet-500" },
              { icon: Zap, label: "Payroll", color: "text-cyan-500" },
              { icon: Globe, label: "History", color: "text-cyan-500" },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-default ${item.active ? "bg-indigo-500/10 text-indigo-400" : "text-textMuted hover:bg-white/5"}`}
              >
                <item.icon className={`h-4 w-4 ${item.active ? item.color : "opacity-40"}`} />
                <span className="hidden sm:inline text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fake Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <div className="space-y-1">
              <h4 className="text-xs text-textMuted font-medium uppercase tracking-widest">Available balance</h4>
              <p className="text-2xl font-mono font-bold text-textPrimary h-8" onMouseEnter={() => setHoverArea("balance")} onMouseLeave={() => setHoverArea(null)}>
                12,840.00 <span className="text-sm opacity-40">USDC</span>
              </p>
            </div>
            <button className="px-5 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg hover:shadow-indigo-500/25 transition-all h-9" onMouseEnter={() => setHoverArea("payroll")} onMouseLeave={() => setHoverArea(null)}>
              Run Payroll
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Employees", val: "24" },
              { label: "Invoices", val: "112" },
              { label: "Countries", val: "8" },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-surfaceUp/30 border border-white/5 shadow-inner">
                <p className="text-[10px] text-textMuted mb-1">{s.label}</p>
                <p className="text-lg font-bold">{s.val}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/5 bg-background/20 overflow-hidden" onMouseEnter={() => setHoverArea("table")} onMouseLeave={() => setHoverArea(null)}>
            <div className="bg-surfaceUp/30 px-4 py-3 flex justify-between items-center border-b border-white/5">
              <p className="text-xs font-bold">Recent Hires</p>
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            </div>
            <div className="p-2 space-y-1">
              {[
                { name: "John Doe", addr: "GCBS...K34L", amt: "2,400" },
                { name: "Sarah Smith", addr: "GDSL...P92X", amt: "1,850" },
                { name: "Arjun Gupta", addr: "GFHY...R11Q", amt: "3,200" },
                { name: "Elena Rossi", addr: "GTRE...W45V", amt: "2,100" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">{row.name.charAt(0)}</div>
                    <div>
                      <p className="text-[11px] font-bold">{row.name}</p>
                      <p className="text-[9px] text-textMuted font-mono">{row.addr}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold font-mono">+{row.amt} ETH</p>
                    <p className="text-[8px] text-cyan-500 font-bold uppercase">Success</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hover Tooltips */}
        {hoverArea === "balance" && (
          <div className="absolute top-24 right-1/4 animate-bounce z-20 px-3 py-1.5 bg-indigo-500 text-white rounded-md text-[10px] font-bold shadow-2xl">
            Real-time balance
          </div>
        )}
        {hoverArea === "payroll" && (
          <div className="absolute top-24 right-20 animate-bounce z-20 px-3 py-1.5 bg-cyan-500 text-white rounded-md text-[10px] font-bold shadow-2xl">
            One-click payroll
          </div>
        )}
        {hoverArea === "table" && (
          <div className="absolute top-2/3 right-1/2 animate-bounce z-20 px-3 py-1.5 bg-cyan-500 text-white rounded-md text-[10px] font-bold shadow-2xl">
            On-chain records
          </div>
        )}
      </div>

      {/* Shadow Reflection */}
      <div className="absolute -bottom-10 left-12 right-12 h-20 bg-indigo-500/10 blur-[60px] -z-10" />
    </div>
  );
}

function ChainFlowDiagram() {
  return (
    <div className="mt-20 py-12 px-6 border border-white/5 rounded-3xl bg-surfaceUp/30 backdrop-blur-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative z-10">
        
        {/* Employer Walllet */}
        <div className="flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Wallet className="h-7 w-7 text-indigo-400" />
          </div>
          <p className="mt-4 text-xs font-bold tracking-widest text-indigo-400 uppercase">Employer</p>
        </div>

        {/* Arrow 1 Container */}
        <div className="w-[100px] h-[2px] bg-white/10 relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 animate-[flowDot_2s_infinite]" />
          <div className="absolute -right-2 -top-1 border-t-4 border-l-4 border-transparent border-l-cyan-500 h-2 w-2" />
        </div>

        {/* Botchain Node */}
        <div className="flex flex-col items-center group">
          <div className="w-20 h-20 rounded-full border-2 border-cyan-500/50 bg-cyan-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] animate-pulse group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-9 w-9 text-cyan-400" />
          </div>
          <p className="mt-4 text-xs font-bold tracking-widest text-cyan-400 uppercase">Botchain Network</p>
        </div>

        {/* Arrow 2 Container */}
        <div className="w-[100px] h-[2px] bg-white/10 relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-500 animate-[flowDot_2s_infinite_0.5s]" />
          <div className="absolute -right-2 -top-1 border-t-4 border-l-4 border-transparent border-l-cyan-500 h-2 w-2" />
        </div>

        {/* Employee Wallet */}
        <div className="flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Users className="h-7 w-7 text-cyan-400" />
          </div>
          <p className="mt-4 text-xs font-bold tracking-widest text-cyan-400 uppercase">Employees</p>
        </div>

      </div>

      {/* Animated Dot Background */}
      <div className="absolute inset-x-0 h-px top-1/2 -z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[0_0_60px_rgba(255,255,255,0.05)]" />
    </div>
  );
}

// ---------- Pricing Components ----------

interface PricingCardProps {
  name: string;
  price: string;
  sub: string;
  features: string[];
  ctaText: string;
  featured?: boolean;
  theme: "violet" | "gradient" | "amber";
}

function PricingCard({ name, price, sub, features, ctaText, featured, theme }: PricingCardProps) {
  const styles = {
    violet: {
      border: "border-violet-500/30",
      badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      check: "text-violet-400",
      btn: "border border-violet-500/50 hover:bg-violet-500/10 text-violet-400",
    },
    gradient: {
      border: "border-transparent",
      badge: "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0",
      check: "text-indigo-400",
      btn: "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg hover:shadow-indigo-500/25",
    },
    amber: {
      border: "border-amber-500/30",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      check: "text-amber-400",
      btn: "border border-amber-500/50 hover:bg-amber-500/10 text-amber-400",
    },
  };

  const s = styles[theme];

  return (
    <div className={`relative p-8 rounded-[24px] bg-surface flex flex-col h-full transition-all duration-500 transform hover:-translate-y-2 ${featured ? "shadow-2xl z-10 scale-105 bg-surfaceUp/80" : "opacity-90"}`}>
      {featured && (
        <div className="absolute inset-0 rounded-[24px] pointer-events-none border-2 border-indigo-500/30 animate-[pulseGlow_4s_infinite]" />
      )}
      
      <div className="mb-8">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${s.badge}`}>
          {featured ? "Most Popular" : name}
        </span>
        <div className="mt-4 flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold ${theme === "gradient" ? "bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent" : "text-textPrimary"}`}>
            {price}
          </span>
          <span className="text-textMuted text-sm font-medium">{sub}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-textMuted">
            <Check className={`h-4 w-4 shrink-0 ${s.check}`} />
            {f}
          </li>
        ))}
      </ul>

      <Link href={name === "Enterprise" ? "/contact" : "/signup"} className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all text-center ${s.btn}`}>
        {ctaText}
      </Link>

      {featured && (
        <p className="mt-4 text-center text-[11px] text-textMuted/60">14-day free trial, no card needed</p>
      )}
    </div>
  );
}


// ---------- FeatureCard component ----------
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  body: string;
  iconBg: string;
  iconColor: string;
  hoverGlow: string;
  index: number;
}

function FeatureCard({ icon: Icon, title, body, iconBg, iconColor, hoverGlow, index }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`bg-surface p-7 rounded-[16px] border border-white/5 shadow-xl transition-all duration-500 transform 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        hover:border-${hoverGlow} hover:-translate-y-1 group relative`}
    >
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-[19px] font-bold text-textPrimary mb-3">{title}</h3>
      <p className="text-textMuted text-[15px] leading-relaxed">{body}</p>
      
      {/* Subtle glow on hover */}
      <div className={`absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_20px_rgba(99,102,241,0.05)]`} style={{ boxShadow: `0 0 20px ${hoverGlow === 'amber-500' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)'}` }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  3) CountUp Value Component
 * ───────────────────────────────────────────── */
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function StatCounter({ end, suffix = "", prefix = "", decimalPlaces = 0, duration = 2000 }: { end: number, suffix?: string, prefix?: string, decimalPlaces?: number, duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const t = Math.min(progress / duration, 1);
      
      const currentVal = easeOutExpo(t) * end;
      setValue(currentVal);

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  const displayValue = value.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <span className="font-mono">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
 *  4) Live Activity Feed Logic
 * ───────────────────────────────────────────── */
interface FeedTx {
  id: string;
  address: string;
  amount: number;
}

function generateRandomAddress() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let addr = "G";
  for(let i=0; i<5; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
  addr += "…";
  for(let i=0; i<4; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
  return addr;
}

/* ─────────────────────────────────────────────
 *  Main Home Page
 * ───────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [feed, setFeed] = useState<FeedTx[]>([]);
  const [isAnnual, setIsAnnual] = useState(false);

  // Deliberately no redirect: being signed in should not lock you out of the
  // marketing site. The header offers a way through to the workspace instead.
  const workspaceHref =
    session?.user?.role === "employer"
      ? "/employer/dashboard"
      : session?.user?.role === "employee"
        ? "/employee/portal"
        : null;

  // Initialize fake feed
  useEffect(() => {
    const initialFeed = Array.from({ length: 5 }).map(() => ({
      id: Math.random().toString(),
      address: generateRandomAddress(),
      amount: Math.floor(Math.random() * 450) + 50,
    }));
    setFeed(initialFeed);

    const intervalId = setInterval(() => {
      setFeed((prev) => {
        const newTx = {
          id: Math.random().toString(),
          address: generateRandomAddress(),
          amount: Math.floor(Math.random() * 450) + 50,
        };
        // push new at front, remove last
        return [newTx, ...prev.slice(0, 4)];
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-4">
        {/* Particle Network fallback for background coherence */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
        </div>

        <div className="relative group">
          {/* Main outer glow */}
          <div className="absolute -inset-8 bg-indigo-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition duration-1000 animate-pulse" />
          
          <div className="relative flex flex-col items-center">
            {/* Spinning Orbit System */}
            <div className="relative w-24 h-24 mb-12">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-[spin_3s_linear_infinite]" />
              {/* Inner Pulsing Core */}
              <div className="absolute inset-4 rounded-full border-b-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-spin" />
              {/* Floating Orbit Dot */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-[ping_1.5s_ease-in-out_infinite]" />
            </div>

            <div className="flex flex-col items-center space-y-3">
              <h1 className="text-xl font-bold tracking-widest uppercase text-white/90">
                Initializing <span className="text-indigo-400">PaySlip</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_0ms]" />
                <div className="h-1 w-1 rounded-full bg-indigo-400 animate-[bounce_1s_infinite_200ms]" />
                <div className="h-1 w-1 rounded-full bg-indigo-300 animate-[bounce_1s_infinite_400ms]" />
              </div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.3em]">
                Secure Pipeline Active
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="absolute bottom-12 w-full max-w-[240px] px-4">
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="relative font-sans overflow-hidden">
        <ParticleNetwork />

      {/* ── Hero Section ── */}
      <main className="flex-1 flex flex-col justify-center relative z-10 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left: Copy & CTAs */}
            <div className="flex-1">
              <div className="mb-8 inline-flex relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative px-4 py-1.5 bg-background rounded-full border border-white/10 flex items-center gap-2 text-sm font-bold tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent italic">Botchain Network Native</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] min-h-[90px] sm:min-h-[160px]">
                The future of <br className="hidden sm:block" />
                <Typewriter words={["payroll", "global payments", "salary disbursement"]} />
              </h1>
              
              <p className="text-lg leading-8 text-muted-foreground max-w-xl mb-10">
                Send salaries to anyone, anywhere. Verified on-chain. Instant settlement. 100% non-custodial and secure.
              </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 mb-14 relative w-full sm:w-auto">
                  <Link
                    href={workspaceHref ?? "/signup"}
                    className="w-full sm:w-auto text-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:bg-indigo-400 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    {workspaceHref ? "Go to your workspace" : "Launch app"}
                  </Link>
                  <Link
                    href="/#features"
                    className="w-full sm:w-auto text-center rounded-full border border-primary/40 px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-primary/5 transition-all duration-300"
                  >
                    View demo
                  </Link>

                  {/* Floating Badges */}
                  <div className="hidden lg:block absolute -right-6 -top-8" style={{ animation: 'float 3s ease-in-out infinite' }}>
                    <div className="px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-sm">
                      <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-violet-400">Instant Settlement</span>
                    </div>
                  </div>
                  <div className="hidden lg:block absolute -left-6 -bottom-10" style={{ animation: 'float 3s ease-in-out infinite reverse', animationDelay: '1s' }}>
                    <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-sm">
                       <ShieldCheck className="h-3 w-3 text-cyan-400" />
                       <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Verified On-Chain</span>
                    </div>
                  </div>
                </div>

              {/* Animated Stat Row */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/20">
                <div>
                  <h4 className="text-[28px] font-bold text-foreground">
                    <StatCounter end={12847} />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Payments sent</p>
                </div>
                <div>
                  <h4 className="text-[28px] font-bold text-foreground">
                    <StatCounter end={2.3} decimalPlaces={1} suffix="M" prefix="ETH " />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Disbursed</p>
                </div>
                <div>
                  <h4 className="text-[28px] font-bold text-foreground">
                    <StatCounter end={99.9} decimalPlaces={1} suffix="%" />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Success rate</p>
                </div>
              </div>
            </div>

            {/* Right: Live Activity Feed */}
            <div className="hidden lg:block w-full max-w-md relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl transform rotate-12" />
              
              <div className="relative bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/20">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live transactions
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                    </span>
                    <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">Live</span>
                  </div>
                </div>

                <div className="space-y-4 h-[320px] overflow-hidden relative">
                  {/* Top fade gradient */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-card/60 to-transparent z-10" />
                  
                  {feed.map((tx, idx) => (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5 transition-all duration-500 transform"
                      style={{
                        animation: idx === 0 ? "slideDown 0.5s ease-out forwards" : "none",
                        opacity: Math.max(1 - (idx * 0.25), 0), // items fade as they go down
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Wallet className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-[13px] font-mono font-medium text-foreground">{tx.address}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {idx === 0 ? "Just now" : `${idx * 2}s ago`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-foreground font-mono">
                          +{tx.amount} <span className="text-[10px] text-muted-foreground font-sans">ETH</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Bottom fade gradient */}
                  <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-card/90 to-transparent z-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── How It Works ── */}
      <HowItWorksSection />

      {/* ── Marquee Ticker ── */}
      <div className="marquee-container">
        <div className="marquee-content flex gap-12 items-center">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Botchain NATIVE
              </span>
              <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" /> INSTANT DISBURSEMENT
              </span>
              <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> NON-CUSTODIAL WALLETS
              </span>
              <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> 100% TRANSPARENT
              </span>
              <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> GLOBAL COMPLIANCE
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Section 2 – Social Proof & Stats */}
      <StatsSection />

      {/* Section 3 – Features Grid */}
      <FeaturesSection />

      {/* Section 4 – Detailed How It Works & Demo (Redundant/Detailed) */}
      <DetailedHowItWorksSection />

      {/* Section 5 – Pricing */}
      <PricingSection isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

      {/* Section 6 – Final CTA & Footer */}
      <FinalCTASection />

      {/* Inject custom keyframes for this page */}
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideRight {
          0% { left: -40%; opacity: 0; }
          50% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
        @keyframes flowDot {
          0% { transform: translateX(-100%) scaleX(0.5); opacity: 0; }
          40% { opacity: 1; transform: translateX(0) scaleX(1); }
          60% { opacity: 1; transform: translateX(100%) scaleX(1); }
          100% { transform: translateX(200%) scaleX(0.5); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}} />
    </div>
  </PageLayout>
  );
}

/* ─────────────────────────────────────────────
 *  5) Section Components (with Scroll Animations)
 * ───────────────────────────────────────────── */

function HowItWorksSection() {
  const [ref, visible] = useScrollAnimation(0.2);
  return (
    <section 
      ref={ref}
      className={`relative z-10 py-16 mb-16 border-t border-border/10 bg-card/30 backdrop-blur-sm transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Ready for liftoff</h2>
          <p className="mt-2 text-muted-foreground text-sm">Deploy payroll globally in three simple steps.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-border/20 z-0">
            <div className="absolute left-0 top-0 h-full bg-primary/40 animate-[slideRight_3s_infinite]" style={{ width: '40%' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: 1, title: "Connect wallet", desc: "No passwords. Just link MetaMask.", icon: Wallet },
              { step: 2, title: "Add employees", desc: "Input names and ETH salaries.", icon: Users },
              { step: 3, title: "Disburse instantly", desc: "Click run, and everyone gets paid.", icon: Zap },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-5 text-primary text-xl font-bold relative group">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300" />
                  <item.icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 opacity-20 pointer-events-none" />
                  <span>{item.step}</span>
                </div>
                <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const [ref, visible] = useScrollAnimation(0.15);
  return (
    <section 
      ref={ref}
      className={`py-24 bg-[linear-gradient(180deg,_#0a0a1a_0%,_#0f0f2e_50%,_#0a0a1a_100%)] transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} 
      role="region" aria-labelledby="social-proof-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 id="social-proof-heading" className="text-center text-hint mb-6">Trusted by teams across 40+ countries</h2>
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {["NOVA", "STACKR", "PAYFLOW", "BUILDX", "DEVHUB", "LAUNCHPAD"].map((name, i) => (
            <span key={i} className={`font-bold text-2xl transform hover:scale-105 transition ${i % 3 === 0 ? 'text-indigo-500' : i % 3 === 1 ? 'text-violet-500' : 'text-cyan-500'}`}>{name}</span>
          ))}
        </div>
        <hr className="border-t border-border/20 my-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Zap} borderColor="border-indigo-500" gradient="from-indigo-500 to-violet-500" label="Payments processed" target={2400000} suffix="+" />
          <StatCard icon={Globe} borderColor="border-cyan-500" gradient="from-cyan-500 to-sky-500" label="ETH disbursed" target={18700000} suffix="+" />
          <StatCard icon={MapPin} borderColor="border-cyan-500" gradient="from-cyan-500 to-indigo-500" label="Countries reached" target={47} />
          <StatCard icon={Building2} borderColor="border-fuchsia-500" gradient="from-fuchsia-500 to-pink-500" label="Companies using PaySlip" target={340} suffix="+" />
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <Testimonial borderColor="border-indigo-500" avatar="A" name="Arjun M." role="CTO at Nova" quote="PaySlip cut our payroll time from 3 days to 3 minutes" />
          <Testimonial borderColor="border-cyan-500" avatar="S" name="Sarah K." role="Ops Lead" quote="First time we paid contractors in 12 countries on the same day" />
          <Testimonial borderColor="border-fuchsia-500" avatar="D" name="Dev T." role="Founder" quote="The blockchain receipt means zero disputes with our freelancers" />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, visible] = useScrollAnimation(0.15);
  return (
    <section 
      ref={ref}
      className={`py-24 relative z-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-bold uppercase tracking-wider mb-4">Why PaySlip</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary max-w-2xl mb-4">
            Everything your <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">global team</span> needs
          </h2>
          <p className="text-textMuted max-w-xl mx-auto mb-6">From 1 employee to 10,000 — PaySlip handles payroll at any scale</p>
          <div className="h-1 w-[60px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard index={0} icon={Rocket} title="Instant global payroll" body="Send salaries to any wallet address worldwide. Transactions confirm in under 5 seconds on Botchain." iconBg="bg-indigo-500/15" iconColor="text-indigo-400" hoverGlow="indigo-500/40" />
          <FeatureCard index={1} icon={Coins} title="Near-zero fees" body="Pay your entire team for less than $0.01 in network fees. No hidden charges, ever." iconBg="bg-amber-500/15" iconColor="text-amber-400" hoverGlow="amber-500/40" />
          <FeatureCard index={2} icon={ShieldCheck} title="Immutable payslips" body="Every payment creates a permanent blockchain record. No disputes, no questions." iconBg="bg-cyan-500/15" iconColor="text-cyan-400" hoverGlow="cyan-500/40" />
          <FeatureCard index={3} icon={ArrowRightLeft} title="ETH and USDC" body="Pay in native ETH or USDC stablecoin. Employees choose what they receive." iconBg="bg-cyan-500/15" iconColor="text-cyan-400" hoverGlow="cyan-500/40" />
          <FeatureCard index={4} icon={Users} title="Unlimited employees" body="Add employees, set salaries, and manage multiple organisations from one dashboard." iconBg="bg-violet-500/15" iconColor="text-violet-400" hoverGlow="violet-500/40" />
          <FeatureCard index={5} icon={FileDown} title="Branded payslips" body="Generate beautiful PDF payslips with your company branding and QR verification." iconBg="bg-fuchsia-500/15" iconColor="text-fuchsia-400" hoverGlow="fuchsia-500/40" />
        </div>
      </div>
    </section>
  );
}

function DetailedHowItWorksSection() {
  const [ref, visible] = useScrollAnimation(0.1);
  return (
    <section 
      ref={ref}
      className={`py-32 relative bg-[#0f0f2e] overflow-hidden transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(139,92,246,0.1),_transparent_50%)]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <h2 className="text-center text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-6">How PaySlip works</h2>
          <p className="text-textMuted text-lg max-w-xl mx-auto">From signup to first payment in under 10 minutes</p>
        </div>
        <div className="relative mb-32 group">
          <div className="hidden lg:block absolute top-[28px] left-[15%] right-[15%] h-[2px] z-0 overflow-hidden">
            <svg className="w-full h-full" overflow="visible">
              <path d="M 0 1 L 1000 1" stroke="url(#grad)" strokeWidth="2" strokeDasharray="8 8" fill="none" className="animate-[dash_60s_linear_infinite]" />
              <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="50%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
            </svg>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 relative z-10">
            <HowItWorksStep step={1} title="Connect your wallet" body="Install MetaMask and connect your EVM wallet in one click." icon={Wallet} color="violet" tag="Takes 30 seconds" />
            <HowItWorksStep step={2} title="Add your team" body="Import employees with their wallet addresses." icon={Users} color="cyan" tag="Import via CSV" />
            <HowItWorksStep step={3} title="Pay with one click" body="Disburse to your entire team in one run." icon={Zap} color="cyan" tag="~100ms blocks" />
          </div>
        </div>
        <div className="space-y-24">
          <DashboardMockup />
          <ChainFlowDiagram />
        </div>
      </div>
    </section>
  );
}

function PricingSection({ isAnnual, setIsAnnual }: { isAnnual: boolean, setIsAnnual: (v: boolean) => void }) {
  const [ref, visible] = useScrollAnimation(0.15);
  return (
    <section 
      ref={ref}
      className={`py-24 relative bg-background overflow-hidden transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent mb-6">Simple, transparent pricing</h2>
          <div className="flex items-center gap-4 bg-surface rounded-full p-1 border border-white/5 shadow-inner">
            <button onClick={() => setIsAnnual(false)} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!isAnnual ? "bg-white/10 text-white shadow-lg" : "text-textMuted hover:text-textPrimary"}`}>Monthly</button>
            <button onClick={() => setIsAnnual(true)} className={`px-6 py-2 rounded-full text-xs font-bold transition-all relative ${isAnnual ? "bg-white/10 text-white shadow-lg" : "text-textMuted hover:text-textPrimary"}`}>
              Annual <span className="absolute -top-7 -right-4 bg-cyan-500/20 text-cyan-400 text-[9px] font-bold py-1 px-2 rounded-md border border-cyan-500/30">SAVE 20%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-4">
          <PricingCard name="Free forever" price="$0" sub="/ month" theme="violet" ctaText="Get started free" features={["Up to 5 employees", "ETH payments only", "Basic payslips"]} />
          <PricingCard name="Pro Plan" price={isAnnual ? "$23" : "$29"} sub={isAnnual ? "/ mo billed annually" : "/ month"} theme="gradient" featured={true} ctaText="Start Pro trial" features={["Unlimited employees", "ETH + USDC payments", "Branded PDF payslips"]} />
          <PricingCard name="Enterprise" price="Custom" sub="" theme="amber" ctaText="Contact us" features={["Everything in Pro", "Custom integrations", "Dedicated support"]} />
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  const [ref, visible] = useScrollAnimation(0.15);
  return (
    <section 
      ref={ref}
      className={`relative py-24 px-6 overflow-hidden transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0a1a3a] to-[#002a1a] -z-10" />
      <div className="mx-auto max-w-4xl text-center relative z-10">
        <div className="mb-10 inline-flex items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl animate-bounce">
          <Rocket className="h-16 w-16 text-indigo-400" />
        </div>
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">Ready to modernize your payroll?</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <Link href="/signup" className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-primary/25 transition-all">Start for free</Link>
          <Link href="/contact" className="w-full sm:w-auto px-10 py-4 border border-white/20 hover:bg-white/5 rounded-full font-bold text-lg transition-all text-center">Book a demo</Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs text-textMuted/60 font-medium tracking-wide">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500" /> No credit card required</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500" /> Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}
