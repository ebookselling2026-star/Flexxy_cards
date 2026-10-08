import React, { useState, useEffect, useRef } from 'react';
import { OrderResponse, TopUpPackage, PaymentMethod } from '../types';
import { fetchOrderStatus, verifyBankUtr } from '../services/api';
import { subscribeToFirebaseOrder } from '../lib/firestoreService';
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
  Lock,
  ArrowRight,
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
  const [activeTab, setActiveTab] = useState<'upi_app' | 'qr_code'>('upi_app');

  const pollIntervalRef = useRef<any>(null);
  const activeFamPayId = order?.fampay_id || 'thakur3041@fam';

  // Sync timer
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

  // Automated status polling & Instant Firebase real-time subscription
  useEffect(() => {
    if (!isOpen || !order?.order_id || isExpired || !isPolling) return;

    // Real-time Firestore listener: instantly triggers when admin updates status on any device
    const unsubscribeFirebase = subscribeToFirebaseOrder(order.order_id, (liveOrder) => {
      const statusStr = String(liveOrder.status || '').toUpperCase();
      if (statusStr === 'SUCCESS') {
        setIsPolling(false);
        const finalUtr = liveOrder.utr || `429${Math.floor(100000000 + Math.random() * 900000000)}`;
        onPaymentSuccess(finalUtr, {
          order_id: order.order_id,
          amount: liveOrder.amount || order.amount,
          diamonds: liveOrder.diamonds || pkg?.diamonds,
          player_uid: liveOrder.player_uid || playerUid,
          buyer_name: liveOrder.customer_name || buyerName,
          buyer_phone: liveOrder.customer_phone || buyerPhone,
        });
      } else if (statusStr === 'EXPIRED') {
        setIsExpired(true);
        setIsPolling(false);
      }
    });

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
      unsubscribeFirebase();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, order?.order_id, isExpired, isPolling, onPaymentSuccess, pkg, playerUid, buyerName, buyerPhone]);

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
      setUtrError('Please enter valid 12-digit Bank UTR / Reference No.');
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
        setUtrError(res.message || 'Payment not verified yet. Please check UTR or retry in 30s.');
      }
    } catch (err: any) {
      setUtrError(err.message || 'Verification error. Auto-polling active.');
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
        setUtrError(`Status: ${result.status}. If paid, paste your 12-digit UTR below.`);
      }
    } catch {
      setUtrError('Could not sync status. Auto-polling active.');
    } finally {
      setManualCheckLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Mobile-Optimized Compact Window (Balanced Ratio) */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#050b10] border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/90 overflow-hidden flex flex-col my-auto transition-all font-terminal">
        {/* Hacker Corner Accents */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

        {/* Compact Header */}
        <div className="bg-gradient-to-r from-[#07130f] via-[#091a14] to-[#050b10] px-3.5 py-2.5 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  FLEXXY CARDS <span className="text-emerald-400">// PAY</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] font-mono font-bold text-emerald-300">
                  256-BIT SSL
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                <span>ORDER: {order.order_id}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? <Check className="w-2.5 h-2.5 text-emerald-400 inline" /> : <Copy className="w-2.5 h-2.5 inline" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expired State */}
        {isExpired ? (
          <div className="p-5 text-center space-y-3 my-auto">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 mx-auto flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase text-white">SESSION EXPIRED</h3>
            <p className="text-slate-400 text-xs font-mono max-w-xs mx-auto">
              15-minute payment window closed. Please generate a fresh order.
            </p>
            <button
              onClick={onRetry}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Generate Fresh Order
            </button>
          </div>
        ) : (
          /* Streamlined Payment Body (Fits Mobile Viewports Perfectly) */
          <div className="p-3.5 sm:p-4 space-y-3">
            {/* High-Impact Compact Payment Summary Card */}
            <div className="bg-gradient-to-r from-[#07131b] via-[#09181e] to-[#071512] border border-emerald-500/30 rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  FREE FIRE TOP-UP
                </div>
                <div className="text-sm sm:text-base font-black text-cyan-400 font-mono">
                  💎 {pkg.diamonds.toLocaleString('en-IN')} DIAMONDS BALANCE
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                  <span className="text-slate-300">UID: {playerUid}</span>
                  {order.customer_name && (
                    <span className="text-emerald-400 font-bold max-w-[100px] truncate">({order.customer_name})</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 text-glow-hacker leading-tight">
                  {order.amount} INR
                </div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{pad(minutes)}:{pad(seconds)}</span>
                </div>
              </div>
            </div>

            {/* Seamless Tab Mode: 1-Tap UPI App vs Scan QR */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#091118] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('upi_app')}
                className={`py-1.5 px-2 rounded-lg font-terminal text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upi_app'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>1-Tap UPI App</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr_code')}
                className={`py-1.5 px-2 rounded-lg font-terminal text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'qr_code'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR Code</span>
              </button>
            </div>

            {/* TAB 1: 1-Tap Mobile UPI Action */}
            {activeTab === 'upi_app' && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <a
                  href={order.upi_intent}
                  className="w-full py-3 px-3 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:brightness-110 text-slate-950 font-terminal text-sm sm:text-base font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 text-center cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>PAY {order.amount} INR VIA UPI APP</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                </a>

                {/* Quick UPI Apps Icons / Pills */}
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300">PhonePe</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300">GPay</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300">Paytm</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300">FamPay</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#091118] border border-slate-800 text-slate-300">BHIM</span>
                </div>
              </div>
            )}

            {/* TAB 2: Scan QR Code (Compact & Well-Proportioned) */}
            {activeTab === 'qr_code' && (
              <div className="space-y-2 animate-in fade-in duration-150 flex flex-col items-center">
                <div className="relative p-2.5 bg-white rounded-xl shadow-lg border-2 border-emerald-400 flex items-center justify-center">
                  <img
                    src={order.qr_url}
                    alt="UPI Payment QR Code"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono text-center">
                  Scan with any UPI app on any phone to complete {order.amount} INR payment
                </p>
              </div>
            )}

            {/* Single-Tap Copy Merchant UPI ID */}
            <div className="bg-[#091118] border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
              <div className="overflow-hidden mr-2">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">
                  MERCHANT UPI ID:
                </span>
                <span className="font-mono text-xs font-bold text-emerald-300 truncate block">
                  {activeFamPayId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold rounded border border-slate-700 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {utrError && (
              <div className="p-2 bg-red-950/80 border border-red-500/50 rounded-lg text-red-300 text-[11px] flex items-center gap-1.5 font-mono animate-in fade-in duration-150">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="leading-tight">{utrError}</span>
              </div>
            )}

            {/* Compact Manual 12-Digit UTR Verification Form */}
            <form onSubmit={handleManualUtrSubmit} className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="font-bold text-slate-300">VERIFY PAYMENT VIA 12-DIGIT UTR:</span>
                <button
                  type="button"
                  onClick={handleManualCheckStatus}
                  disabled={manualCheckLoading}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Sync Status"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${manualCheckLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Status</span>
                </button>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={16}
                  value={manualUtr}
                  onChange={(e) => {
                    setManualUtr(e.target.value.replace(/\s+/g, ''));
                    if (utrError) setUtrError(null);
                  }}
                  placeholder="e.g. 429188029418"
                  className="flex-1 bg-[#091118] border border-slate-700 focus:border-emerald-500 rounded-lg py-1.5 px-2.5 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={manualUtrLoading || !manualUtr.trim()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer transition-all flex items-center gap-1 shrink-0 font-terminal"
                >
                  {manualUtrLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit UTR</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Minimal High-Trust Bottom Tag */}
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                100% Anti-Ban Official Server
              </span>
              <span className="text-slate-500">
                Automated 60-180s Credit
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
