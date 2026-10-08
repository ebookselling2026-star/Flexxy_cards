import React from 'react';
import { TopUpPackage } from '../types';
import { Diamond, ArrowRight, ShieldCheck, Wifi } from 'lucide-react';

interface PricingCardProps {
  pkg: TopUpPackage;
  onSelect: (pkg: TopUpPackage) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ pkg, onSelect }) => {
  const isPopular = pkg.popular;
  const isMega = pkg.bestValue;

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 transition-all duration-300 group hover:-translate-y-1.5 overflow-hidden border font-terminal flex flex-col justify-between shadow-2xl ${
        isPopular
          ? 'bg-gradient-to-br from-[#0c1f19] via-[#061410] to-[#020806] border-emerald-400/90 shadow-emerald-950/80 box-glow-hacker ring-1 ring-emerald-400/50'
          : isMega
          ? 'bg-gradient-to-br from-[#0b1d28] via-[#05131a] to-[#02090d] border-cyan-400/90 shadow-cyan-950/80 box-glow-cyan ring-1 ring-cyan-400/50'
          : 'bg-gradient-to-br from-[#0c161f] via-[#060e14] to-[#020508] border-slate-700/90 hover:border-emerald-500/80 hover:shadow-emerald-950/50'
      }`}
      style={{ minHeight: '290px' }}
    >
      {/* Decorative Card Holographic / Grid Lines Watermark */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.06)_0%,transparent_50%,rgba(6,182,212,0.05)_100%)] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      {/* TOP ROW: Realistic EMV Smart Chip + Contactless Wave + Brand Header + Badge */}
      <div className="relative z-10 flex items-start justify-between gap-3 mb-4 pb-3 border-b border-emerald-500/15">
        <div className="flex items-center gap-3">
          {/* Realistic Metallic Gold/Cyber EMV Chip */}
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1.5px] shadow-md shrink-0">
            <div className="w-full h-full bg-[#1c180a] rounded-[3px] p-0.5 flex flex-col justify-between overflow-hidden border border-amber-300/40">
              <div className="h-1.5 border-b border-amber-400/40 flex justify-between">
                <span className="w-2 border-r border-amber-400/40" />
                <span className="w-2 border-l border-amber-400/40" />
              </div>
              <div className="h-2 flex items-center justify-center">
                <div className="w-3 h-2 rounded-[2px] bg-amber-400/30 border border-amber-400/60" />
              </div>
              <div className="h-1.5 border-t border-amber-400/40 flex justify-between">
                <span className="w-2 border-r border-amber-400/40" />
                <span className="w-2 border-l border-amber-400/40" />
              </div>
            </div>
          </div>

          {/* Contactless RFID Wave Icon */}
          <div className="rotate-90 text-emerald-400/70 shrink-0">
            <Wifi className="w-4 h-4" />
          </div>

          {/* Card Label Header */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
                FLEXXY CARD
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/90 tracking-wider font-mono block">
              DIAMOND BALANCE CARD
            </span>
          </div>
        </div>

        {/* Right Corner: Diamond Emblem & Card Type Badge */}
        <div className="flex items-center gap-2">
          {pkg.badge && (
            <span
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border font-mono ${
                isPopular
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/70 shadow-sm'
                  : isMega
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 shadow-sm'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700'
              }`}
            >
              {pkg.badge}
            </span>
          )}
          <div className="w-7 h-7 rounded-full bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center">
            <Diamond className="w-4 h-4 text-cyan-400 fill-cyan-400/30" />
          </div>
        </div>
      </div>

      {/* CENTER ROW: Virtual Embossed Card Number + Card Name + Price & Balance */}
      <div className="relative z-10 my-2 space-y-2">
        {/* Virtual Card Number Format */}
        <div className="text-[11px] sm:text-xs text-slate-400 font-mono tracking-[0.2em] flex items-center gap-3">
          <span>8840</span>
          <span>••••</span>
          <span>••••</span>
          <span className="text-emerald-400 font-bold">{pkg.amount}</span>
        </div>

        {/* Large Amount & Diamond Balance Display */}
        <div className="pt-1">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight text-glow-hacker">
              {pkg.amount} INR
            </span>
            <span className="text-xs text-slate-500 line-through font-mono">
              MRP ₹{pkg.originalPrice}
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-cyan-300 tracking-wide text-glow-cyan uppercase mt-0.5">
            {pkg.diamonds.toLocaleString('en-IN')} DIAMONDS BALANCE CARD
          </div>
        </div>
      </div>

      {/* BOTTOM ROW INSIDE CARD: Details on Left, "BUY NOW" on Right Bottom */}
      <div className="relative z-10 pt-3 mt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        {/* Left Side: Card Details (UID dispatch, server, speed) */}
        <div className="space-y-1 text-[11px] text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">DISPATCH:</span>
            <span className="text-emerald-400 font-bold">DIRECT PLAYER UID</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-500">SERVER:</span>
            <span className="text-cyan-400 font-bold">INDIA OFFICIAL (GARENA)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-500">DELIVERY:</span>
            <span className="text-slate-300">INSTANT (60-180 SEC)</span>
          </div>
        </div>

        {/* Right Bottom: High-Contrast BUY NOW Button situated right here */}
        <div className="sm:self-end w-full sm:w-auto">
          <button
            onClick={() => onSelect(pkg)}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-terminal text-sm sm:text-base font-black uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isPopular
                ? 'bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 text-slate-950 hover:brightness-110 shadow-emerald-500/40'
                : isMega
                ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-slate-950 hover:brightness-110 shadow-cyan-500/40'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/30'
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
