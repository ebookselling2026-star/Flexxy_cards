import React from 'react';
import { UserCheck, QrCode, Zap, HelpCircle, ShieldCheck } from 'lucide-react';

interface HowToRedeemProps {
  onOpenUidGuide: () => void;
}

export const HowToRedeem: React.FC<HowToRedeemProps> = ({ onOpenUidGuide }) => {
  return (
    <section id="how-to-redeem" className="py-12 sm:py-16 bg-[#04070b] border-t border-b border-emerald-500/15 font-terminal">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-emerald-500/20 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1">
              <span className="text-emerald-500 font-bold">// PROTOCOL</span>
              <span>3-STEP AUTOMATED REDEMPTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              EXECUTION <span className="text-emerald-400">PIPELINE</span>
            </h2>
          </div>

          <button
            onClick={onOpenUidGuide}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>[GUIDE: FIND PLAYER UID]</span>
          </button>
        </div>

        {/* 3 Aligned Terminal Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Step 1 */}
          <div className="bg-[#060c12] border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-mono">
                <span className="text-emerald-400 font-bold">[STEP_01]</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold uppercase text-white mb-1.5">
                SELECT CARD & INPUT UID
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Choose voucher tier (300 to 2000 INR) and paste your official 8-12 digit Free Fire Player UID.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              VALIDATION: REAL-TIME GARENA CHECK
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#060c12] border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-mono">
                <span className="text-emerald-400 font-bold">[STEP_02]</span>
                <QrCode className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold uppercase text-white mb-1.5">
                1-TAP UPI APP OR SCAN QR
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Tap 1-Tap UPI for direct PhonePe / GPay / Paytm / FamPay checkout, or scan the dynamic UPI QR.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              SECURITY: RBI UPI COMPLIANT
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#060c12] border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-mono">
                <span className="text-emerald-400 font-bold">[STEP_03]</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold uppercase text-white mb-1.5">
                AUTOMATED IN-GAME CREDIT
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                API confirms broadcast and dispatches diamond balance to your Player UID within 60-180 seconds.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>100% ANTI-BAN GUARANTEE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
