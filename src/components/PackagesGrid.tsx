import React from 'react';
import { TOP_UP_PACKAGES } from '../data/packages';
import { TopUpPackage } from '../types';
import { PricingCard } from './PricingCard';
import { ShieldCheck, Terminal, Award } from 'lucide-react';

interface PackagesGridProps {
  onSelectPackage: (pkg: TopUpPackage) => void;
}

export const PackagesGrid: React.FC<PackagesGridProps> = ({ onSelectPackage }) => {
  return (
    <section id="packages" className="py-12 sm:py-16 relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 font-terminal">
      {/* Terminal Section Header */}
      <div className="mb-8 border-b border-emerald-500/20 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FLEXXY CARDS // DIGITAL VOUCHER CATALOG</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
            AVAILABLE <span className="text-emerald-400 text-glow-hacker">DIAMOND CARDS</span>
          </h2>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OFFICIAL UID DISPATCH · 100% ANTI-BAN</span>
        </div>
      </div>

      {/* 2-Column Responsive Card Grid (Gift Card / Voucher Ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {TOP_UP_PACKAGES.map((pkg) => (
          <PricingCard
            key={pkg.id}
            pkg={pkg}
            onSelect={onSelectPackage}
          />
        ))}
      </div>

      {/* Aligned Terminal Status Footer */}
      <div className="mt-8 p-4 bg-[#050b10] border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">[!] NOTE:</span>
          <span>Zero passwords needed. Direct credit to player Free Fire UID within 60-180 seconds.</span>
        </div>
        <div className="text-emerald-400 font-bold shrink-0">
          <span>RBI UPI & FAMPAY SECURE</span>
        </div>
      </div>
    </section>
  );
};
