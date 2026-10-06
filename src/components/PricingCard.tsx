import React from 'react';
import { TopUpPackage } from '../types';
import { Diamond, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface PricingCardProps {
  pkg: TopUpPackage;
  onSelect: (pkg: TopUpPackage) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ pkg, onSelect }) => {
  const isPopular = pkg.popular;
  const isMega = pkg.bestValue;

  return (
    <div
      className={`relative w-full rounded-2xl p-5 sm:p-6 transition-all duration-300 group hover:-translate-y-1 overflow-hidden border font-terminal flex flex-col justify-between shadow-xl ${
        isPopular
          ? 'bg-gradient-to-br from-[#071714] via-[#05100e] to-[#030807] border-emerald-400/80 shadow-emerald-950/70 box-glow-hacker ring-1 ring-emerald-400/40'
          : isMega
          ? 'bg-gradient-to-br from-[#061720] via-[#050f16] to-[#03080d] border-cyan-400/80 shadow-cyan-950/70 box-glow-cyan ring-1 ring-cyan-400/40'
          : 'bg-gradient-to-br from-[#071118] via-[#050c12] to-[#03070b] border-slate-700/80 hover:border-emerald-500/60 hover:shadow-emerald-950/40'
      }`}
      style={{ minHeight: '270px' }}
    >
      {/* Subtle Card Circuit Watermark Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

      {/* Top Row: Smart Card Chip + Flexxy Brand + Card Type Badge */}
      <div className="relative z-10 flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/15">
        <div className="flex items-center gap-2.5">
          {/* Cyber Metallic Smartcard Chip */}
          <div className="w-9 h-7 rounded bg-gradient-to-br from-emerald-950 via-emerald-800 to-black border border-emerald-400/60 flex items-center justify-center p-0.5 shadow-inner">
            <div className="w-full h-full border border-emerald-400/30 rounded-xs flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-200 block uppercase">
              FLEXXY CARDS // VOUCHER
            </span>
            <span className="text-[9px] text-emerald-400/80 tracking-widest block font-mono">
              ID: CARD-{pkg.amount}
            </span>
          </div>
        </div>

        {/* Right Corner Card Badge */}
        <div className="flex items-center gap-2">
          {pkg.badge && (
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                isPopular
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60'
                  : isMega
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700'
              }`}
            >
              {pkg.badge}
            </span>
          )}
          <Diamond className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
        </div>
      </div>

      {/* Center Body: Exact User Format: "300 INR" and "10,000 DIAMONDS BALANCE" */}
      <div className="relative z-10 space-y-1.5 my-auto py-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight text-glow-hacker">
            {pkg.amount} INR
          </span>
          <span className="text-xs text-slate-500 line-through font-mono">
            MRP {pkg.originalPrice} INR
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-cyan-400 tracking-wide text-glow-cyan">
            {pkg.diamonds.toLocaleString('en-IN')} DIAMONDS BALANCE
          </span>
        </div>

        {pkg.bonusDiamonds > 0 && (
          <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>+{pkg.bonusDiamonds.toLocaleString('en-IN')} BONUS DIAMONDS INCLUDED</span>
          </div>
        )}
      </div>

      {/* Bottom Row inside card: Details on Left, "BUY NOW" on Right Bottom */}
      <div className="relative z-10 pt-3 mt-4 border-t border-emerald-500/15 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        {/* Left Side Specs inside card */}
        <div className="space-y-1 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DIRECT PLAYER UID DISPATCH</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>100% ANTI-BAN // GARENA SERVER</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DELIVERY: 60-180 SECONDS</span>
          </div>
        </div>

        {/* Right Bottom Side: BUY NOW Button situated right here */}
        <div className="sm:self-end">
          <button
            onClick={() => onSelect(pkg)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-terminal text-sm sm:text-base font-black uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isPopular
                ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 hover:brightness-110 shadow-emerald-500/40'
                : isMega
                ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-slate-950 hover:brightness-110 shadow-cyan-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            <span>BUY NOW</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
