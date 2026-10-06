import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Transaction {
  id: string;
  uid: string;
  diamonds: number;
  timeAgo: string;
  amount: number;
  server: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', uid: '2948****19', diamonds: 70000, timeAgo: 'Just now', amount: 1500, server: 'IND' },
  { id: 'tx-2', uid: '3819****44', diamonds: 120000, timeAgo: '1m ago', amount: 2000, server: 'IND' },
  { id: 'tx-3', uid: '1850****72', diamonds: 40000, timeAgo: '2m ago', amount: 1000, server: 'IND' },
  { id: 'tx-4', uid: '4820****09', diamonds: 10000, timeAgo: '3m ago', amount: 300, server: 'IND' },
];

export const LiveTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  useEffect(() => {
    const packs = [
      { d: 10000, a: 300 },
      { d: 40000, a: 1000 },
      { d: 70000, a: 1500 },
      { d: 120000, a: 2000 },
    ];

    const interval = setInterval(() => {
      const randomPack = packs[Math.floor(Math.random() * packs.length)];
      const randomPrefix = Math.floor(1000 + Math.random() * 8999);
      const randomSuffix = Math.floor(10 + Math.random() * 89);
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        uid: `${randomPrefix}****${randomSuffix}`,
        diamonds: randomPack.d,
        timeAgo: 'Just now',
        amount: randomPack.a,
        server: 'IND',
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 3)]);
    }, 16000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-6 sm:py-8 bg-[#03060a] border-b border-emerald-500/10 font-terminal">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">$ log --stream</span>
            <span className="text-slate-400">// LIVE GARENA DISPATCH LEDGER</span>
          </div>
          <div className="text-[11px] text-slate-500">
            STATUS: REAL-TIME BROADCAST [VERIFIED]
          </div>
        </div>

        {/* Clean Monospace Aligned Ledger Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-[#050b10] border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono"
            >
              <div>
                <span className="text-[11px] text-slate-400 block">
                  UID: <strong className="text-slate-200">{tx.uid}</strong>
                </span>
                <span className="text-cyan-400 font-bold text-xs">
                  💎 +{tx.diamonds.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-emerald-400 font-bold block text-xs">
                  {tx.amount} INR
                </span>
                <span className="text-[10px] text-slate-500">
                  {tx.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
