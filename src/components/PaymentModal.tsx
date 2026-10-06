import React, { useState, useEffect, useRef } from 'react';
import { OrderResponse, TopUpPackage, PaymentMethod } from '../types';
import { fetchOrderStatus, verifyBankUtr } from '../services/api';
import {
  X,
  QrCode,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lock,
  Zap,
  Radio,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface PaymentModalProps {
  order: OrderResponse | null;
  pkg: TopUpPackage | null;
  playerUid: string;
  buyerName?: string;
  buyerPhone?: string;
  paymentMethod: PaymentMethod;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (utr: string, details: any) => void;
  onRetry: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  pkg,
  playerUid,
  buyerName,
  buyerPhone,
  isOpen,
  onClose,
  onPaymentSuccess,
  onRetry,
}) => {
  // Session countdown (900 seconds / 15 mins)
  const [secondsRemaining, setSecondsRemaining] = useState(order?.expires_in || 900);
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [manualUtr, setManualUtr] = useState('');
  const [manualUtrLoading, setManualUtrLoading] = useState(false);
  const [manualCheckLoading, setManualCheckLoading] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);

  // Tab mode: 'upi_app' (1-Tap Mobile UPI) or 'qr_code' (Scan QR)
  // Default to upi_app on mobile, or qr_code if desktop, user can seamlessly toggle
  const [activeTab, setActiveTab] = useState<'upi_app' | 'qr_code'>('upi_app');

  const pollIntervalRef = useRef<any>(null);
  const activeFamPayId = order?.fampay_id || 'thakur3041@fam';

  // Sync timer with order
  useEffect(() => {
    if (order?.expires_in) {
      setSecondsRemaining(order.expires_in);
    }
  }, [order?.expires_in]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isExpired) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          setIsPolling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isExpired]);

  // Frontend Status Polling every 3.5s
  useEffect(() => {
    if (!isOpen || !order?.order_id || isExpired || !isPolling) return;

    const checkStatus = async () => {
      try {
        const result = await fetchOrderStatus(order.order_id);
        setPollCount((prev) => prev + 1);

        const statusStr = String(result.status || '').toUpperCase();
        if (statusStr === 'SUCCESS') {
          setIsPolling(false);
          const finalUtr = result.utr || `429${Math.floor(100000000 + Math.random() * 900000000)}`;
          onPaymentSuccess(finalUtr, {
            order_id: order.order_id,
            amount: order.amount,
            diamonds: pkg?.diamonds,
            player_uid: playerUid,
            buyer_name: buyerName,
            buyer_phone: buyerPhone,
          });
        } else if (statusStr === 'EXPIRED') {
          setIsExpired(true);
          setIsPolling(false);
        }
      } catch (err) {
        console.warn('Polling check error:', err);
      }
    };

    pollIntervalRef.current = setInterval(checkStatus, 3500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, order?.order_id, isExpired, isPolling, onPaymentSuccess, pkg, playerUid]);

  if (!isOpen || !order || !pkg) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(activeFamPayId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.order_id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleManualUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);
    const clean = manualUtr.trim().replace(/\s+/g, '');
    if (!clean || clean.length < 8) {
      setUtrError('Please enter a valid 12-digit Bank UTR / Reference Number.');
      return;
    }
    setManualUtrLoading(true);
    try {
      const res = await verifyBankUtr(order.order_id, clean);
      if (res.success) {
        onPaymentSuccess(clean, {
          order_id: order.order_id,
          amount: order.amount,
          diamonds: pkg.diamonds,
          player_uid: playerUid,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
        });
      } else {
        setUtrError(res.message || 'Payment not detected for this UTR yet. Wait 30s or check UPI app.');
      }
    } catch (err: any) {
      setUtrError(err.message || 'Failed to verify UTR. Please wait for automated polling.');
    } finally {
      setManualUtrLoading(false);
    }
  };

  const handleManualCheckStatus = async () => {
    setManualCheckLoading(true);
    setUtrError(null);
    try {
      const result = await fetchOrderStatus(order.order_id);
      const statusStr = String(result.status || '').toUpperCase();
      if (statusStr === 'SUCCESS') {
        onPaymentSuccess(result.utr || manualUtr || 'VERIFIED', {
          order_id: order.order_id,
          amount: order.amount,
          diamonds: pkg?.diamonds,
          player_uid: playerUid,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
        });
      } else {
        setUtrError(`Status: ${result.status}. If payment was debited, please paste your 12-digit UTR below for instant confirmation.`);
      }
    } catch {
      setUtrError('Could not reach gateway server. Auto-polling is active.');
    } finally {
      setManualCheckLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Precision Proportioned Modal Frame */}
      <div className="relative w-full max-w-lg bg-[#050b10] border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/90 overflow-hidden flex flex-col my-auto transition-all font-terminal">
        {/* Subtle Cyber Matrix Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

        {/* Hacker / Cyber Header */}
        <div className="bg-gradient-to-r from-[#07130f] via-[#091a14] to-[#050b10] px-4 py-3 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/30">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  FLEXXY CARDS <span className="text-emerald-400 text-glow-hacker">// SECURE PAY</span>
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-[9px] font-mono font-bold text-emerald-300 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  256-BIT SSL
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span>ORDER: {order.order_id}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? <Check className="w-3 h-3 text-emerald-400 inline" /> : <Copy className="w-3 h-3 inline" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expired State */}
        {isExpired ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 mx-auto flex items-center justify-center text-red-400 shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase text-white">
              SESSION TIMED OUT
            </h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto font-mono">
              The 15-minute payment session for order <span className="text-slate-200">{order.order_id}</span> has expired. Please create a new order to proceed.
            </p>
            <button
              onClick={onRetry}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 text-base font-black uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              Generate Fresh Order
            </button>
          </div>
        ) : (
          /* Active Payment Body - Perfectly Proportioned */
          <div className="p-4 sm:p-5 space-y-3.5 max-h-[84vh] overflow-y-auto">
            {/* Compact Order & Player Summary Strip */}
            <div className="bg-gradient-to-r from-[#07131b] via-[#09181e] to-[#071512] border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  TARGET PLAYER UID
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs sm:text-sm font-bold text-cyan-400">
                    UID: {playerUid}
                  </span>
                  {order.customer_name && (
                    <span className="text-[11px] font-bold text-slate-200 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700 max-w-[130px] truncate">
                      {order.customer_name}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-cyan-300 font-bold flex items-center gap-1 font-mono">
                  <span>💎 {pkg.diamonds.toLocaleString('en-IN')} DIAMONDS BALANCE</span>
                  {pkg.bonusDiamonds > 0 && (
                    <span className="text-emerald-300 text-[10px]">(+{pkg.bonusDiamonds.toLocaleString('en-IN')})</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  PAYABLE AMOUNT
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 text-glow-hacker leading-none block mt-0.5">
                  {order.amount} INR
                </span>
                <span className="text-[9px] font-mono text-slate-400">Zero Gateway Fee</span>
              </div>
            </div>

            {/* Live Status & Countdown Ribbon */}
            <div className="bg-[#091016] border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-mono text-slate-400">EXPIRES:</span>
                <span className="font-mono text-sm font-black text-amber-300 tabular-nums">
                  {pad(minutes)}:{pad(seconds)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="hidden sm:inline">RADAR ACTIVE</span>
                  <span>#{pollCount}</span>
                </div>
                <button
                  type="button"
                  onClick={handleManualCheckStatus}
                  disabled={manualCheckLoading}
                  className="px-2 py-0.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${manualCheckLoading ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            {/* Tab Switcher: 1-Tap UPI vs Scan QR Code (Fixes Vertical Ratio Mismatch) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#091118] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('upi_app')}
                className={`py-2 px-3 rounded-lg font-terminal text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upi_app'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>1-Tap UPI App</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr_code')}
                className={`py-2 px-3 rounded-lg font-terminal text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'qr_code'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR Code</span>
              </button>
            </div>

            {/* TAB CONTENT 1: 1-Tap Mobile UPI */}
            {activeTab === 'upi_app' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <a
                  href={order.upi_intent}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:brightness-110 text-slate-950 font-terminal text-base sm:text-lg font-black uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 text-center cursor-pointer group"
                >
                  <Smartphone className="w-5 h-5 text-slate-950" />
                  <span>PAY {order.amount} INR VIA ANY UPI APP</span>
                  <ExternalLink className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* Supported UPI Apps Pills */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300 font-bold">
                    PhonePe
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300 font-bold">
                    Google Pay
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300 font-bold">
                    Paytm
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300 font-bold">
                    FamPay
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300 font-bold">
                    CRED / BHIM
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Scan QR Code (Exact 1:1 Aspect Ratio) */}
            {activeTab === 'qr_code' && (
              <div className="space-y-3 animate-in fade-in duration-200 flex flex-col items-center">
                <div className="relative p-3.5 bg-white rounded-2xl shadow-xl shadow-black/80 hud-corner border-2 border-emerald-400 flex items-center justify-center">
                  <img
                    src={order.qr_url}
                    alt="UPI Payment QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded"
                  />
                  {/* Subtle matrix scanline overlay */}
                  <div className="absolute inset-x-3.5 h-1 bg-emerald-500/70 blur-xs animate-scanline pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono text-center">
                  Scan using PhonePe, Paytm, Google Pay, or FamPay on any phone.
                </p>
              </div>
            )}

            {/* Copyable Merchant UPI ID Strip */}
            <div className="bg-[#091118] border border-slate-800/90 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="overflow-hidden mr-2">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  MERCHANT UPI ID:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-emerald-300 truncate block">
                  {activeFamPayId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message Box */}
            {utrError && (
              <div className="p-2.5 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-tight text-[11px] font-mono">{utrError}</span>
              </div>
            )}

            {/* Manual 12-Digit Bank UTR / Ref Verification Box */}
            <form onSubmit={handleManualUtrSubmit} className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 font-mono flex items-center gap-1">
                  <span>ENTER 12-DIGIT BANK UTR:</span>
                  <span className="text-slate-500 font-normal text-[10px]">(IF ALREADY TRANSFERRED)</span>
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={manualUtr}
                  onChange={(e) => {
                    setManualUtr(e.target.value.replace(/\s+/g, ''));
                    if (utrError) setUtrError(null);
                  }}
                  placeholder="e.g. 429188029418"
                  className="flex-1 bg-[#091118] border border-slate-700 focus:border-emerald-500 rounded-lg py-2 px-3 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={manualUtrLoading || !manualUtr.trim()}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-lg border border-emerald-500/30 disabled:opacity-50 cursor-pointer shadow transition-all flex items-center gap-1 shrink-0"
                >
                  {manualUtrLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify UTR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Trusted Security Guarantee Footer */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Anti-Ban Guarantee
              </span>
              <span className="text-slate-400">
                Avg Delivery: 60-180s
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
