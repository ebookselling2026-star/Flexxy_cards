import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Clock, Diamond, ArrowDown, Lock, Zap } from 'lucide-react';

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
    <section className="relative overflow-hidden pt-4 pb-8 sm:pt-8 sm:pb-14 border-b border-emerald-500/20 font-terminal">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-5 text-center">
          {/* Terminal Command Line Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#050b10] border border-emerald-500/40 text-emerald-400 text-xs font-mono">
            <span className="text-emerald-500 font-bold">$</span>
            <span>flexxy-cards --vault-status=ACTIVE --dispatch=UID_SERVER</span>
            <span className="w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          {/* Clean Terminal Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            FLEXXY CARDS <span className="text-emerald-400 text-glow-hacker">// DIAMOND VAULT</span>
          </h1>

          {/* Minimal High-Value Proposition */}
          <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-xl mx-auto leading-relaxed">
            Direct player top-up via Garena official server. Zero account password needed. Automated bank-grade UPI verification with instant 60-180 second credit.
          </p>

          {/* Concise Aligned Status Bar */}
          <div className="max-w-2xl mx-auto bg-[#050b10] border border-emerald-500/30 rounded-xl p-3.5 sm:p-4 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left text-xs font-mono">
              <div className="p-2 rounded bg-[#081219] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">SECURITY</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
                </span>
              </div>
              <div className="p-2 rounded bg-[#081219] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">ANTI-BAN</span>
                <span className="text-emerald-400 font-bold">100% Guaranteed</span>
              </div>
              <div className="p-2 rounded bg-[#081219] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">SPEED</span>
                <span className="text-cyan-400 font-bold">60-180s Credit</span>
              </div>
              <div className="p-2 rounded bg-[#081219] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TIMER</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="#packages"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 font-terminal text-sm font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Diamond className="w-4 h-4 fill-slate-950" />
              <span>SELECT DIAMOND CARD</span>
            </a>

            <a
              href="#how-to-redeem"
              className="px-5 py-3 bg-[#081119] hover:bg-[#0c1622] text-slate-300 hover:text-white font-terminal text-xs sm:text-sm font-bold uppercase rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>EXECUTION FLOW</span>
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
