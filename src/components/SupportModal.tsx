import React from 'react';
import { X, MessageCircle, Clock, ShieldCheck, HelpCircle, PhoneCall, ChevronDown } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How long does diamond delivery take?',
      a: 'Diamonds are processed automatically via Flexxy Cards automated server dispatch and are credited to your Free Fire Player UID within 60 to 180 seconds of payment confirmation.',
    },
    {
      q: 'Will my Free Fire account get banned?',
      a: 'No, 100% Anti-Ban guarantee. We operate legitimate distributor top-ups directly via official Garena server channels. We never ask for your account password, email, or OTP.',
    },
    {
      q: 'What if my payment went through but status is pending?',
      a: 'Banks sometimes take 30-60 seconds to synchronize UPI broadcast. You can paste your 12-digit UTR in the payment window or message our 24/7 WhatsApp desk for immediate manual release.',
    },
    {
      q: 'Which payment methods are supported?',
      a: 'We support all UPI apps (PhonePe, Google Pay, Paytm, FamPay, CRED, BHIM) and automated dynamic UPI QR code scanning.',
    },
  ];

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent('Hi Flexxy Cards Support, I need help with my Free Fire Diamond Top-Up order.');
    window.open(`https://wa.me/919286520702?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#070b10] border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/80 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-[#091118] px-4 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-gaming text-base sm:text-lg font-black uppercase tracking-wider text-white">
              FLEXXY CARDS · 24/7 SUPPORT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* WhatsApp Direct Connect CTA Card */}
          <div className="bg-gradient-to-r from-emerald-950/70 to-teal-950/50 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block uppercase tracking-wide">
                  Live WhatsApp Helpline
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  Online 24/7 · Avg Response: 2 mins
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-gaming text-xs font-bold uppercase tracking-wider rounded-lg shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
            >
              CHAT NOW
            </button>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              FREQUENTLY ASKED QUESTIONS
            </h4>

            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#05080c] border border-slate-800 rounded-xl p-3 space-y-1">
                <h5 className="text-xs font-bold text-slate-200 flex items-start gap-1.5">
                  <span className="text-emerald-400 font-mono">Q:</span>
                  <span>{faq.q}</span>
                </h5>
                <p className="text-[11px] text-slate-400 pl-4 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Flexxy Cards Official Resolution Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
