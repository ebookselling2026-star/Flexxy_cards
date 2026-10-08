import React, { useState, useEffect, useRef } from 'react';
import { TopUpPackage, PaymentMethod, CheckoutFormData } from '../types';
import { verifyFreeFirePlayer } from '../services/api';
import {
  X,
  Diamond,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  UserCheck,
  CheckCircle2,
  Lock,
  User,
  Phone,
} from 'lucide-react';

interface CheckoutModalProps {
  pkg: TopUpPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CheckoutFormData) => Promise<void>;
  onOpenUidGuide: () => void;
  isLoading: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSubmit,
  onOpenUidGuide,
  isLoading,
}) => {
  const [step, setStep] = useState<'enter_uid' | 'account_details'>('enter_uid');
  const [playerUid, setPlayerUid] = useState('');
  const [region, setRegion] = useState('India (IND)');
  const [buyerName, setBuyerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod] = useState<PaymentMethod>('fampay_upi');
  const [error, setError] = useState<string | null>(null);

  // Live Free Fire Player Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<{
    uid?: string;
    name?: string;
    level?: number;
    likes?: number;
    guild?: string;
    region?: string;
  } | null>(null);
  const [customName, setCustomName] = useState('');

  const lastVerifiedUidRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (!playerInfo) {
        setStep('enter_uid');
      }
    }
  }, [isOpen]);

  if (!isOpen || !pkg) return null;

  const handleUidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPlayerUid(val);
    setError(null);

    if (playerInfo && val !== playerInfo.uid) {
      setPlayerInfo(null);
    }
  };

  const performVerification = async (uidToVerify: string) => {
    const cleanUid = uidToVerify.trim().replace(/\D/g, '');
    if (!cleanUid || cleanUid.length < 6) {
      setError('Please enter a valid Free Fire Player UID (digits only, 6-12 digits).');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await verifyFreeFirePlayer(cleanUid, region);

      if (res.success && res.verified) {
        lastVerifiedUidRef.current = cleanUid;
        const verifiedData = {
          uid: cleanUid,
          name: res.player?.name || 'FREE FIRE PLAYER',
          level: res.player?.level || 70,
          likes: res.player?.likes || 0,
          guild: res.player?.guild || 'NO GUILD',
          region: res.player?.region || region,
        };
        setPlayerInfo(verifiedData);
        setCustomName(verifiedData.name);
        setStep('account_details');
      } else {
        setError(res.message || 'Player UID not found on Free Fire server. Please check your UID.');
        setPlayerInfo(null);
      }
    } catch {
      setError('Could not reach Free Fire verification server. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = buyerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your full name (Buyer Name).');
      return;
    }

    const trimmedPhone = phone.trim().replace(/\D/g, '');
    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setError('Please enter your 10-digit WhatsApp number.');
      return;
    }

    await onSubmit({
      playerUid: playerUid.trim(),
      region,
      ign: customName.trim() || playerInfo?.name || '',
      buyerName: trimmedName,
      phone: trimmedPhone,
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 font-terminal">
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#050b10] border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/80 overflow-hidden flex flex-col my-auto">
        {/* Compact Hacker Header */}
        <div className="bg-gradient-to-r from-[#07130f] via-[#091a14] to-[#050b10] px-3.5 py-2.5 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Diamond className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                {step === 'enter_uid' ? 'FLEXXY CARDS // STEP 1: VERIFY UID' : 'FLEXXY CARDS // STEP 2: DETAILS'}
              </h3>
              <span className="text-[9px] text-emerald-400 font-mono block">
                OFFICIAL GARENA DISPATCH
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading || isVerifying}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Package Banner (Compact) */}
        <div className="px-3.5 py-2 bg-[#081219] border-b border-slate-800/80 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-cyan-400 font-mono">
              💎 {pkg.diamonds.toLocaleString('en-IN')} DIAMONDS BALANCE
            </span>
          </div>
          <div className="text-right">
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono text-glow-hacker">
              {pkg.amount} INR
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto">
          {/* STEP 1: ENTER PLAYER UID */}
          {step === 'enter_uid' && (
            <div className="space-y-3">
              {error && (
                <div className="p-2.5 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="font-mono text-[11px] leading-tight">{error}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1 font-mono">
                    <span>PLAYER UID</span>
                    <span className="text-emerald-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={onOpenUidGuide}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Find UID</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={12}
                  value={playerUid}
                  onChange={handleUidChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      performVerification(playerUid);
                    }
                  }}
                  placeholder="Enter 8-12 Digit UID (e.g. 2469113941)"
                  className="w-full bg-[#091118] border border-slate-700 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-white text-sm sm:text-base tracking-wider font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Region Selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                  SERVER REGION
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#091118] border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-2.5 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="India (IND)">India (IND Server)</option>
                  <option value="Bangladesh (BD)">Bangladesh (BD Server)</option>
                  <option value="Pakistan (PK)">Pakistan (PK Server)</option>
                  <option value="Singapore / Global">Singapore / SEA Server</option>
                  <option value="Global">Global Server</option>
                </select>
              </div>

              {/* Verification Button */}
              <button
                type="button"
                disabled={isVerifying || playerUid.length < 6}
                onClick={() => performVerification(playerUid)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 font-terminal text-sm sm:text-base font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>VERIFYING GARENA PROFILE...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>VERIFY PLAYER PROFILE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: ACCOUNT VERIFIED -> BUYER DETAILS */}
          {step === 'account_details' && playerInfo && (
            <form onSubmit={handleProceedToPayment} className="space-y-3">
              {error && (
                <div className="p-2.5 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="font-mono text-[11px]">{error}</span>
                </div>
              )}

              {/* Compact Verified Player Badge */}
              <div className="rounded-xl bg-[#081219] border border-emerald-500/50 p-2.5 flex items-center justify-between text-xs font-mono">
                <div className="overflow-hidden mr-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED: {playerInfo.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    UID: {playerUid} • LVL {playerInfo.level || 70}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('enter_uid')}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 underline shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Buyer Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-mono flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-400" />
                  <span>YOUR NAME (BUYER NAME)</span>
                  <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Enter your name (e.g. Rahul Sharma)"
                  className="w-full bg-[#091118] border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>WHATSAPP MOBILE NUMBER</span>
                  <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit WhatsApp number"
                    className="w-full bg-[#091118] border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 pl-11 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('enter_uid')}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !buyerName.trim() || phone.length !== 10}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 font-terminal text-sm sm:text-base font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>GENERATING UPI ORDER...</span>
                    </>
                  ) : (
                    <>
                      <span>PROCEED TO PAY {pkg.amount} INR</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
