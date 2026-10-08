import React, { useState, useEffect } from 'react';
import { ShieldCheck, Diamond, X } from 'lucide-react';

interface LiveTransactionItem {
  id: string;
  uid: string;
  diamonds: number;
  amount: number;
  timeAgo: string;
  server: string;
}

const SAMPLE_DATA: Omit<LiveTransactionItem, 'id' | 'timeAgo'>[] = [
  { uid: '2948****19', diamonds: 10000, amount: 300, server: 'IND' },
  { uid: '3819****44', diamonds: 40000, amount: 1000, server: 'IND' },
  { uid: '1850****72', diamonds: 10000, amount: 300, server: 'IND' },
  { uid: '4820****09', diamonds: 70000, amount: 1500, server: 'IND' },
  { uid: '5912****83', diamonds: 120000, amount: 2000, server: 'IND' },
  { uid: '2109****65', diamonds: 10000, amount: 300, server: 'IND' },
  { uid: '3381****90', diamonds: 40000, amount: 1000, server: 'IND' },
  { uid: '4490****27', diamonds: 10000, amount: 300, server: 'IND' },
  { uid: '6712****15', diamonds: 70000, amount: 1500, server: 'IND' },
];

export const LiveTransactions: React.FC = () => {
  const [currentTx, setCurrentTx] = useState<LiveTransactionItem>({
    id: 'tx-init',
    uid: '2469****41',
    diamonds: 10000,
    amount: 300,
    timeAgo: 'Just now',
    server: 'IND',
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    // Cycle every 7 seconds:
    // Visible for 4.8 seconds, then slides out for 2.2 seconds, updates data, and slides in
    const cycle = () => {
      setIsVisible(true);

      hideTimer = setTimeout(() => {
        setIsVisible(false);

        nextTimer = setTimeout(() => {
          // Generate realistic new transaction
          const base = SAMPLE_DATA[Math.floor(Math.random() * SAMPLE_DATA.length)];
          const randomPrefix = Math.floor(1000 + Math.random() * 8999);
          const randomSuffix = Math.floor(10 + Math.random() * 89);
          const seconds = Math.floor(3 + Math.random() * 25);

          setCurrentTx({
            id: `tx-${Date.now()}`,
            uid: `${randomPrefix}****${randomSuffix}`,
            diamonds: base.diamonds,
            amount: base.amount,
            timeAgo: `${seconds}s ago`,
            server: 'IND',
          });

          // Show next
          cycle();
        }, 2200);
      }, 4800);
    };

    cycle();

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 max-w-[320px] sm:max-w-xs transition-all duration-500 ease-out font-terminal ${
        isVisible
          ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto'
          : '-translate-x-12 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative bg-[#040a10]/95 backdrop-blur-md border border-emerald-500/50 rounded-xl p-3 sm:p-3.5 shadow-2xl shadow-emerald-950/80 box-glow-hacker overflow-hidden">
        {/* Glow ambient background line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 animate-pulse" />

        {/* Header row: Live pulse + verified status + dismiss button */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-emerald-500/15">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
              LIVE DISPATCH VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-400 font-mono">
              {currentTx.timeAgo}
            </span>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors cursor-pointer"
              title="Close notification"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content body: Diamond badge + UID + Package Details */}
        <div className="flex items-center gap-2.5">
          {/* Cyan Diamond Badge */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-950 via-[#071a17] to-black border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-inner">
            <Diamond className="w-5 h-5 text-cyan-300 fill-cyan-400/20" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                UID: <strong className="text-white font-mono">{currentTx.uid}</strong>
              </span>
              <span className="text-emerald-400 font-bold text-xs font-mono">
                {currentTx.amount} INR
              </span>
            </div>

            <div className="text-[11px] font-bold text-cyan-300 truncate">
              {currentTx.diamonds.toLocaleString('en-IN')} Diamonds Balance
            </div>

            <div className="flex items-center gap-1 text-[9px] text-emerald-400/90 font-mono mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Direct Garena Server Credit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
