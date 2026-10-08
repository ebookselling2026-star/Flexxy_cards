import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Diamond, ArrowDown, Zap, Lock } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 30 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 9000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="relative overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-emerald-500/20 font-terminal">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 text-center space-y-4">
        {/* Simple Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#050b10] border border-emerald-500/40 text-emerald-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>OFFICIAL GARENA SERVER DISPATCH • 100% SECURE</span>
        </div>

        {/* Clean, Impactful Title */}
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
          FLEXXY <span className="text-emerald-400 text-glow-hacker">CARDS</span>
        </h1>

        {/* Concise Subtitle - Zero Fluff */}
        <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-lg mx-auto leading-relaxed">
          Instant Free Fire diamond balance delivered straight to your Player UID. No password required. Instant automated UPI verification.
        </p>

        {/* Compact Status Bar */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-6 bg-[#050b10] border border-emerald-500/30 rounded-xl px-4 py-2 text-xs font-mono text-slate-300 flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Anti-Ban</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span>60-180s Delivery</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums font-bold">{pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>
          </div>
        </div>

        {/* Direct Action CTA */}
        <div className="pt-2">
          <a
            href="#packages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 font-terminal text-sm font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Diamond className="w-4 h-4 fill-slate-950" />
            <span>VIEW DIAMOND CARDS</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
