import React from 'react';
import { Terminal } from 'lucide-react';

interface FooterProps {
  onOpenTrack: () => void;
  onOpenSupport: () => void;
  onOpenUidGuide: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTrack,
  onOpenSupport,
  onOpenUidGuide,
}) => {
  return (
    <footer className="bg-[#020508] border-t border-emerald-500/15 text-slate-400 text-xs font-terminal">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          {/* Brand */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-black tracking-wider uppercase text-white">
                FLEXXY <span className="text-emerald-400">CARDS</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Official Free Fire Diamond Voucher & Card Terminal // Bank-Grade UPI Automation
            </p>
          </div>

          {/* Quick Monospace Actions */}
          <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
            <button
              onClick={onOpenTrack}
              className="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              [TRACK_ORDER]
            </button>
            <button
              onClick={onOpenUidGuide}
              className="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              [FIND_UID]
            </button>
            <button
              onClick={onOpenSupport}
              className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              [WHATSAPP_SUPPORT]
            </button>
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} FLEXXY CARDS. ALL RIGHTS RESERVED. POWERED BY FAMGATEWAY.</span>
          <span>DISCLAIMER: INDEPENDENT TOP-UP PLATFORM. FREE FIRE & GARENA ARE TRADEMARKS OF GARENA.</span>
        </div>
      </div>
    </footer>
  );
};
