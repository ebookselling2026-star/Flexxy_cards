import React from 'react';
import { X, Copy, Check, Info, ShieldCheck } from 'lucide-react';

interface UidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UidGuideModal: React.FC<UidGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#070b10] border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/80 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-[#091118] px-4 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" />
            <h3 className="font-gaming text-base sm:text-lg font-black uppercase tracking-wider text-white">
              FLEXXY CARDS · FIND PLAYER UID
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Guide Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30 font-mono">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">
                  Open Free Fire & Tap Your Profile
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  In the Free Fire lobby, tap your avatar banner in the top-left corner.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30 font-mono">
                2
              </span>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">
                  Locate Your UID in Gallery Tab
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Under your character card, you will find <span className="text-emerald-400 font-mono font-bold">UID: 2469113941</span> (8 to 12 digits).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30 font-mono">
                3
              </span>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">
                  Tap the Copy Icon Next to UID
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tap the tiny clipboard icon beside the digits to copy it directly, then paste it into Flexxy Cards checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Sample Card */}
          <div className="p-3 bg-[#05080c] border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
            <span className="text-slate-500 uppercase text-[9px] block">EXAMPLE FREE FIRE IDENTIFIER</span>
            <div className="flex items-center justify-between text-slate-200">
              <span>Player UID:</span>
              <span className="text-emerald-400 font-bold">2469113941</span>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span>Server Region:</span>
              <span className="text-cyan-400">India (IND)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Anti-Ban Guarantee
            </span>
            <span className="text-slate-400">Zero Password Needed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
