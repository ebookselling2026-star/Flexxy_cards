import React, { useState } from 'react';
import { lookupOrders } from '../services/api';
import { OrderRecord } from '../types';
import { X, Search, CheckCircle2, Clock, Diamond, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrderRecord[] | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const orders = await lookupOrders(query.trim());
      setResults(orders);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#070b10] border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/80 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-[#091118] px-4 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <h3 className="font-gaming text-base sm:text-lg font-black uppercase tracking-wider text-white">
              FLEXXY CARDS · TRACK ORDER
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[75vh]">
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 block">
              ENTER ORDER ID OR FREE FIRE PLAYER UID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. fg_XXXXX or 2469113941"
                className="flex-1 bg-[#05080c] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-gaming text-sm font-bold uppercase rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>TRACK</span>
              </button>
            </div>
          </form>

          {/* Results list */}
          {searched && (
            <div className="space-y-3 pt-2">
              {results && results.length > 0 ? (
                results.map((ord) => (
                  <div
                    key={ord.order_id}
                    className="p-3.5 bg-[#05080c] border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-mono text-[11px] text-slate-400">ORDER: {ord.order_id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          ord.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : ord.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">PLAYER UID</span>
                        <span className="text-cyan-400 font-bold">{ord.player_uid}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">AMOUNT</span>
                        <span className="text-white font-bold">₹{ord.amount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">DIAMONDS</span>
                        <span className="text-emerald-400 font-bold">💎 {ord.diamonds?.toLocaleString('en-IN') || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">CREATED AT</span>
                        <span className="text-slate-300">{new Date(ord.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {ord.utr && (
                      <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                        <span>UTR: </span>
                        <span className="text-amber-300 font-bold">{ord.utr}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs font-mono space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-600 mx-auto" />
                  <p>No orders found for "{query}". Please check your Order ID or Player UID.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
