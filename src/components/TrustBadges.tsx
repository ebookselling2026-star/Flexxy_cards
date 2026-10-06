import React from 'react';
import { ShieldCheck, Zap, MessageCircle, Lock } from 'lucide-react';

interface TrustBadgesProps {
  onOpenSupport: () => void;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ onOpenSupport }) => {
  return (
    <section className="py-10 sm:py-14 bg-[#03060a] border-t border-emerald-500/10 font-terminal">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between border-b border-emerald-500/15 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="text-emerald-500 font-bold">// SECURITY_AUDIT</span>
            <span>VERIFIED PROTECTION METRICS</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            COMPLIANCE: BANK-GRADE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Badge 1 */}
          <div className="bg-[#050b10] border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-mono">
              <h4 className="text-sm font-bold text-white uppercase mb-1">
                100% Anti-Ban Guarantee
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct official Garena server top-up via Player UID only. Zero account passwords, emails, or logins required.
              </p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="bg-[#050b10] border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="font-mono">
              <h4 className="text-sm font-bold text-white uppercase mb-1">
                Automated 60-180s Credit
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct UPI integration triggers automated diamond dispatch directly to your vault upon payment detection.
              </p>
            </div>
          </div>

          {/* Badge 3 */}
          <div
            onClick={onOpenSupport}
            className="bg-[#050b10] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 flex items-start gap-3.5 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="font-mono">
              <h4 className="text-sm font-bold text-white uppercase mb-1 flex items-center gap-2">
                <span>24/7 WhatsApp Support</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded">ONLINE</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Support agents are online 24/7 for instantaneous payment verification and live order tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
