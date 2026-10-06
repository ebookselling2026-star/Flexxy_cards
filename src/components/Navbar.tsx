import React, { useState } from 'react';
import { ShieldCheck, Search, HelpCircle, MessageCircle, Menu, X, Lock, Diamond, Terminal } from 'lucide-react';

interface NavbarProps {
  onOpenTrack: () => void;
  onOpenSupport: () => void;
  onOpenUidGuide: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTrack,
  onOpenSupport,
  onOpenUidGuide,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#04070b]/95 backdrop-blur-md border-b border-emerald-500/25 font-terminal">
        {/* Terminal Micro Header Bar */}
        <div className="bg-[#020508] text-emerald-400 text-[10px] sm:text-[11px] font-mono py-1 px-3 border-b border-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>FLEXXY_CARDS_GATEWAY v3.1 // STATUS: ONLINE [GARENA-IND-SERVER]</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>PORT: 3000</span>
            <span>SSL: 256-BIT</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-950 border border-emerald-400/60 flex items-center justify-center p-0.5 shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>

              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-wider uppercase text-white leading-none">
                  FLEXXY <span className="text-emerald-400 text-glow-hacker">CARDS</span>
                </span>
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  GAMING VOUCHER VAULT
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <a href="#packages" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span className="text-emerald-500">[01]</span>
              <span>CARDS</span>
            </a>
            <a href="#how-to-redeem" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span className="text-emerald-500">[02]</span>
              <span>STEPS</span>
            </a>
            <button
              onClick={onOpenUidGuide}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-slate-300 cursor-pointer"
            >
              <span className="text-emerald-500">[03]</span>
              <span>FIND UID</span>
            </button>
            <button
              onClick={onOpenTrack}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-slate-300 cursor-pointer"
            >
              <span className="text-emerald-500">[04]</span>
              <span>TRACK</span>
            </button>
            <button
              onClick={onOpenSupport}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-slate-300 cursor-pointer"
            >
              <span className="text-emerald-500">[05]</span>
              <span>SUPPORT</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
              title="Store Admin Panel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-mono font-bold">ADMIN</span>
            </button>

            <a
              href="#packages"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg active:scale-95 transition-all shadow-md shadow-emerald-500/25 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Diamond className="w-3.5 h-3.5 fill-slate-950" />
              <span>CLAIM CARD</span>
            </a>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[88px] z-30 bg-[#05080c] border-b border-emerald-500/30 p-4 space-y-2 font-mono text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-200">
          <a
            href="#packages"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-[#091118] hover:bg-emerald-500/10 text-white flex items-center gap-2"
          >
            <span className="text-emerald-400">[01]</span>
            <span>Available Cards</span>
          </a>
          <a
            href="#how-to-redeem"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-[#091118] hover:bg-emerald-500/10 text-white flex items-center gap-2"
          >
            <span className="text-emerald-400">[02]</span>
            <span>Execution Steps</span>
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenUidGuide();
            }}
            className="w-full p-2.5 rounded-lg bg-[#091118] hover:bg-emerald-500/10 text-white flex items-center gap-2 text-left"
          >
            <span className="text-emerald-400">[03]</span>
            <span>Locate Free Fire UID</span>
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTrack();
            }}
            className="w-full p-2.5 rounded-lg bg-[#091118] hover:bg-emerald-500/10 text-white flex items-center gap-2 text-left"
          >
            <span className="text-emerald-400">[04]</span>
            <span>Track Order Delivery</span>
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSupport();
            }}
            className="w-full p-2.5 rounded-lg bg-[#091118] hover:bg-emerald-500/10 text-white flex items-center gap-2 text-left"
          >
            <span className="text-emerald-400">[05]</span>
            <span>24/7 WhatsApp Desk</span>
          </button>
        </div>
      )}
    </>
  );
};
