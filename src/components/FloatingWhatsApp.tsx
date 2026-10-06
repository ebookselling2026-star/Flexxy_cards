import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  onOpenSupport?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = () => {
  const handleOpenWhatsApp = () => {
    window.open(
      'https://wa.me/919286520702?text=' +
        encodeURIComponent('Hi Flexxy Cards Support, I have a query about Free Fire Diamond Top-Up.'),
      '_blank'
    );
  };

  return (
    <button
      onClick={handleOpenWhatsApp}
      className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-30 p-3 sm:p-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer font-terminal"
      aria-label="WhatsApp Helpline: 9286520702"
    >
      <MessageCircle className="w-6 h-6 fill-slate-950" />
      <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider pr-1">
        WhatsApp Desk
      </span>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#04070b] animate-ping" />
    </button>
  );
};
