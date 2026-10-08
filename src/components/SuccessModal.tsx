import React, { useState, useEffect } from 'react';
import { CheckCircle2, Diamond, Copy, Check, Sparkles, Clock, ShieldCheck, ArrowRight, X, Trophy, MessageCircle, ExternalLink } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  utr: string;
  orderId: string;
  amount: number;
  diamonds: number;
  playerUid: string;
  buyerName?: string;
  buyerPhone?: string;
  planName?: string;
  onTrackOrder: (orderId: string) => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  utr,
  orderId,
  amount,
  diamonds,
  playerUid,
  buyerName = 'Buyer',
  buyerPhone = '',
  planName,
  onTrackOrder,
}) => {
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const displayPlan = planName || `${diamonds.toLocaleString('en-IN')} Diamonds Balance`;
  
  // Exact user requested format:
  // "Hello, I am buyer_name i pruchased <this_plan> of <this_amount> and my uid is <player_uid>."
  const exactCustomMsg = `Hello, I am ${buyerName} i pruchased ${displayPlan} of ${amount} INR and my uid is ${playerUid}. (Order ID: ${orderId}, UTR: ${utr})`;
  const whatsappUrl = `https://wa.me/919286520702?text=${encodeURIComponent(exactCustomMsg)}`;

  // Automatically trigger WhatsApp window once on mount
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        try {
          window.open(whatsappUrl, '_blank');
        } catch {
          // Handled via explicit button
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen, whatsappUrl]);

  if (!isOpen) return null;

  const handleCopyUtr = () => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleCopyCustomMsg = () => {
    navigator.clipboard.writeText(exactCustomMsg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in zoom-in-95 duration-200 font-terminal">
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#050b10] border-2 border-emerald-500/60 rounded-2xl shadow-2xl shadow-emerald-950/80 overflow-hidden my-auto flex flex-col">
        {/* Glow backdrop behind modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 blur-[80px] pointer-events-none" />

        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="p-4 text-center border-b border-slate-800/80 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-1.5 shadow-lg shadow-emerald-500/30 text-emerald-400">
            <Trophy className="w-5 h-5" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>PAYMENT VERIFIED // DISPATCH READY</span>
          </span>

          <h3 className="text-lg sm:text-xl font-black uppercase text-white mb-1">
            TRANSACTION CONFIRMED
          </h3>

          <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-lg p-2">
            <p className="text-emerald-300 font-mono text-xs">
              Diamonds adding to UID: <span className="text-white font-bold">{playerUid}</span> within 60-180s!
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto max-h-[75vh]">
          {/* PRIMARY WHATSAPP DISPATCH CARD (Target: 9286520702) */}
          <div className="bg-[#08151b] border-2 border-emerald-400/80 rounded-xl p-3.5 space-y-2.5 shadow-lg shadow-emerald-950/60">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WHATSAPP SELLER CONFIRMATION</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                9286520702
              </span>
            </div>

            {/* Custom Message Terminal Preview */}
            <div className="bg-[#04080d] border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-300 relative group">
              <span className="text-[9px] text-slate-500 block uppercase mb-1">
                // MESSAGE SENT TO +91 9286520702:
              </span>
              <p className="text-emerald-300 text-[11px] leading-relaxed break-words">
                "{exactCustomMsg}"
              </p>
              <button
                type="button"
                onClick={handleCopyCustomMsg}
                className="mt-2 text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer font-mono"
              >
                {copiedMsg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMsg ? 'Message Copied' : 'Copy Message Text'}</span>
              </button>
            </div>

            {/* 1-Tap WhatsApp Dispatch Button */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 font-terminal text-sm font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>SEND TO WHATSAPP (9286520702)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Receipt Specs */}
          <div className="bg-[#05080c] border border-slate-800 rounded-xl p-3 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 text-[11px]">ORDER ID</span>
              <span className="font-bold text-white text-xs">{orderId}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 text-[11px]">BUYER NAME</span>
              <span className="font-bold text-slate-200 text-xs">{buyerName}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 text-[11px]">TARGET UID</span>
              <span className="font-bold text-cyan-400 text-xs">{playerUid}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 text-[11px]">BALANCE</span>
              <span className="font-bold text-cyan-400 text-xs">💎 {diamonds.toLocaleString('en-IN')} Diamonds</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 text-[11px]">PAID AMOUNT</span>
              <span className="font-bold text-emerald-400 text-xs">{amount} INR</span>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-slate-400 text-[11px]">VERIFIED UTR</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-amber-300 text-xs">{utr}</span>
                <button
                  type="button"
                  onClick={handleCopyUtr}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                  title="Copy UTR"
                >
                  {copiedUtr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1 font-mono">
            <button
              type="button"
              onClick={() => {
                onClose();
                onTrackOrder(orderId);
              }}
              className="w-full py-2.5 bg-[#091118] hover:bg-slate-800 text-slate-300 hover:text-white font-terminal text-xs sm:text-sm font-bold uppercase rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>TRACK LIVE DELIVERY STATUS</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
