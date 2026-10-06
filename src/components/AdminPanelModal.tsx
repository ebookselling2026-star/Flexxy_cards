import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  Key,
  Save,
  Check,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Settings,
  ArrowRight,
  LogOut,
  Zap,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFamPayIdUpdated?: (newId: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onFamPayIdUpdated,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ff_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<'orders' | 'gateway' | 'hlgaming' | 'security'>('orders');

  // Orders and Stats
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    successOrders: 0,
    pendingOrders: 0,
    expiredOrders: 0,
    totalRevenue: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'EXPIRED'>('ALL');

  // FamPay Gateway Config
  const [fampayId, setFampayId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState('');

  // HL Gaming Free Fire API Config
  const [hlUseruid, setHlUseruid] = useState('');
  const [hlApiKey, setHlApiKey] = useState('');
  const [hlConfigured, setHlConfigured] = useState(false);
  const [hlSaving, setHlSaving] = useState(false);
  const [hlSaveMsg, setHlSaveMsg] = useState('');
  const [testUid, setTestUid] = useState('9351564274');
  const [testRegion, setTestRegion] = useState('ind');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Change PIN
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');
  const [pinChangeErr, setPinChangeErr] = useState('');

  // Copy tracking
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load orders and config when open and authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated]);

  const loadAdminData = async () => {
    setLoadingOrders(true);
    try {
      const [ordersRes, configRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/gateway-config'),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success) {
          setOrders(data.orders || []);
          setStats(data.stats || {});
          if (data.currentFamPayId) {
            setFampayId(data.currentFamPayId);
          }
          if (data.hlGamingConfigured !== undefined) {
            setHlConfigured(data.hlGamingConfigured);
          }
          if (data.hlGamingUseruid) {
            setHlUseruid(data.hlGamingUseruid);
          }
        }
      }

      if (configRes.ok) {
        const cfg = await configRes.json();
        if (cfg.fampayId) {
          setFampayId(cfg.fampayId);
        }
      }
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveHlConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setHlSaving(true);
    setHlSaveMsg('');

    try {
      const res = await fetch('/api/admin/update-hl-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useruid: hlUseruid.trim(),
          api: hlApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHlConfigured(data.hlGamingConfigured);
        setHlSaveMsg('HL Gaming Free Fire API credentials saved successfully!');
      }
    } catch {
      setHlSaveMsg('Failed to update HL Gaming credentials');
    } finally {
      setHlSaving(false);
    }
  };

  const handleTestPlayerLookup = async () => {
    if (!testUid.trim()) return;
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/verify-player?uid=${encodeURIComponent(testUid.trim())}&region=${encodeURIComponent(testRegion)}`);
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Lookup failed' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('ff_admin_auth', 'true');
        setPinInput('');
        loadAdminData();
      } else {
        setAuthError('Incorrect Admin Passcode. Default is admin123');
      }
    } catch {
      setAuthError('Server error while authenticating');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ff_admin_auth');
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMessage('');

    try {
      const res = await fetch('/api/gateway-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fampayId: fampayId.trim(),
          apiKey: apiKey.trim() || undefined,
        }),
      });

      if (res.ok) {
        setConfigMessage('FamPay UPI ID and Gateway settings updated successfully!');
        if (onFamPayIdUpdated) {
          onFamPayIdUpdated(fampayId.trim());
        }
      }
    } catch {
      setConfigMessage('Failed to update FamPay ID.');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleForceStatus = async (orderId: string, status: string) => {
    try {
      const customUtr = prompt('Enter Bank UTR (or leave empty to auto-generate):');
      const res = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status,
          utr: customUtr || undefined,
        }),
      });

      if (res.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckLiveStatus = async (orderId: string) => {
    try {
      const res = await fetch(`/api/checkout-status?order_id=${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        alert(`Order ${orderId}\nStatus: ${data.status}\nUTR: ${data.utr || 'None'}`);
        loadAdminData();
      }
    } catch {
      alert('Error fetching live status from FamGateway');
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeErr('');
    setPinChangeMsg('');

    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPinChangeMsg('Admin PIN changed successfully!');
        setCurrentPin('');
        setNewPin('');
      } else {
        setPinChangeErr(data.message || 'Failed to change PIN');
      }
    } catch {
      setPinChangeErr('Server error updating PIN');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!isOpen) return null;

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const q = orderSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      ord.order_id?.toLowerCase().includes(q) ||
      ord.player_uid?.includes(q) ||
      ord.customer_name?.toLowerCase().includes(q) ||
      ord.customer_phone?.includes(q) ||
      ord.utr?.includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUCCESS' && ord.status === 'SUCCESS') ||
      (statusFilter === 'PENDING' && ord.status === 'PENDING') ||
      (statusFilter === 'EXPIRED' && ord.status === 'EXPIRED');

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#070b10] border-t sm:border border-emerald-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-emerald-950/80 overflow-hidden my-0 sm:my-6 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#091118] px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-gaming text-xl font-bold uppercase tracking-wider text-white">
                  Flexxy Cards Admin Portal
                </h3>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.2 rounded border border-red-500/30 uppercase">
                  Staff Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Manage FamPay UPI payment settings & track all customer diamond orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 mx-auto flex items-center justify-center text-orange-400 shadow-lg shadow-orange-950/40">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-gaming text-2xl font-bold uppercase text-white mb-1">
                Enter Admin Passcode
              </h4>
              <p className="text-xs text-slate-400">
                Authorized store managers only. Default passcode: <code className="text-amber-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">admin123</code>
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Admin PIN"
                className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-3 px-4 text-white text-center font-mono text-base tracking-widest placeholder:text-slate-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={authLoading || !pinInput}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-gaming text-lg font-black uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>{authLoading ? 'Verifying...' : 'Unlock Admin Portal'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Bar */}
            <div className="bg-[#10141e] border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Orders Tracker ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('gateway')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'gateway'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>FamPay UPI Config</span>
                </button>

                <button
                  onClick={() => setActiveTab('hlgaming')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'hlgaming'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Free Fire API (HL Gaming)</span>
                  {hlConfigured ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'security'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>Admin PIN</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Current FamPay ID:</span>
                <span className="text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {fampayId || 'thakur3041@fam'}
                </span>
              </div>
            </div>

            {/* TAB 1: ORDERS TRACKER */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#121622] border border-slate-800 rounded-xl p-3.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Total Orders
                    </span>
                    <span className="font-gaming text-2xl font-black text-white tabular-nums">
                      {stats.totalOrders || 0}
                    </span>
                  </div>

                  <div className="bg-[#121622] border border-slate-800 rounded-xl p-3.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Total Revenue
                    </span>
                    <span className="font-gaming text-2xl font-black text-amber-400 tabular-nums">
                      ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-[#121622] border border-slate-800 rounded-xl p-3.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Delivered (Success)
                    </span>
                    <span className="font-gaming text-2xl font-black text-emerald-400 tabular-nums">
                      {stats.successOrders || 0}
                    </span>
                  </div>

                  <div className="bg-[#121622] border border-slate-800 rounded-xl p-3.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Pending Verification
                    </span>
                    <span className="font-gaming text-2xl font-black text-orange-400 tabular-nums">
                      {stats.pendingOrders || 0}
                    </span>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search by Player UID, Order ID, Phone, or UTR..."
                      className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-xl border border-slate-800 shrink-0">
                    {(['ALL', 'SUCCESS', 'PENDING', 'EXPIRED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                          statusFilter === st
                            ? 'bg-orange-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={loadAdminData}
                    disabled={loadingOrders}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center justify-center shrink-0 transition-colors"
                    title="Refresh Orders"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord) => (
                      <div
                        key={ord.order_id}
                        className="bg-[#121622] border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                      >
                        {/* Order Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              {ord.order_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(ord.order_id)}
                              className="text-slate-400 hover:text-white"
                              title="Copy Order ID"
                            >
                              {copiedText === ord.order_id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="text-[11px] text-slate-400">
                              · {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 ${
                                ord.status === 'SUCCESS'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : ord.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {ord.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                              {ord.status === 'PENDING' && <Clock className="w-3 h-3" />}
                              {ord.status === 'EXPIRED' && <AlertTriangle className="w-3 h-3" />}
                              <span>{ord.status}</span>
                            </span>

                            <span className="font-gaming text-lg font-black text-amber-400">
                              ₹{ord.amount}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Diamond Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                          <div className="bg-[#0a0d14] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">Player UID:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-cyan-300 font-bold">{ord.player_uid}</span>
                              <button
                                onClick={() => copyToClipboard(ord.player_uid)}
                                className="text-slate-400 hover:text-white"
                                title="Copy UID"
                              >
                                {copiedText === ord.player_uid ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="bg-[#0a0d14] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">Diamonds:</span>
                            <span className="font-gaming font-bold text-cyan-400 text-sm">
                              {ord.diamonds?.toLocaleString('en-IN') || '10,000'} 💎
                            </span>
                          </div>

                          <div className="bg-[#0a0d14] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">FamPay ID:</span>
                            <span className="font-mono text-amber-300 text-xs truncate max-w-[130px]">
                              {ord.fampay_id || fampayId}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info & UTR Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                          <div className="flex items-center gap-3">
                            {ord.customer_name && (
                              <span>IGN: <strong className="text-slate-200">{ord.customer_name}</strong></span>
                            )}
                            {ord.customer_phone && (
                              <span>Phone: <strong className="text-slate-200">{ord.customer_phone}</strong></span>
                            )}
                            {ord.utr && (
                              <span className="bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-300 font-mono text-[11px]">
                                UTR: {ord.utr}
                              </span>
                            )}
                          </div>

                          {/* Quick Admin Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCheckLiveStatus(ord.order_id)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold border border-slate-700"
                            >
                              Check FamGateway
                            </button>

                            {ord.status !== 'SUCCESS' && (
                              <button
                                onClick={() => handleForceStatus(ord.order_id, 'SUCCESS')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 space-y-2">
                      <Package className="w-8 h-8 mx-auto text-slate-500" />
                      <p className="text-xs">No orders match your filter criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: FAMPAY & GATEWAY CONFIG */}
            {activeTab === 'gateway' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto space-y-5">
                <div>
                  <h4 className="font-gaming text-xl font-bold uppercase text-white mb-1">
                    FamPay UPI ID Configuration
                  </h4>
                  <p className="text-xs text-slate-400">
                    Set the exact FamPay UPI ID where payments will be directed. Changes apply instantly to all newly generated QR codes.
                  </p>
                </div>

                {configMessage && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{configMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSaveGateway} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">
                      Active FamPay UPI ID (VPA) <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fampayId}
                        onChange={(e) => setFampayId(e.target.value.trim())}
                        placeholder="e.g. thakur3041@fam or yourhandle@fam"
                        className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-amber-300 font-mono text-sm placeholder:text-slate-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                        FamPay
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Customers will scan QR or send money to this FamPay ID.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">
                      FamGateway API Key <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value.trim())}
                        placeholder="Leave blank to keep existing Secret API Key"
                        className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none"
                      />
                      <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Live key from your <span className="text-orange-400">famgateway.in</span> merchant account.
                    </p>
                  </div>

                  <div className="bg-[#121622] rounded-xl p-3 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Only users with the Admin passcode can access or modify this FamPay UPI ID.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={configSaving || !fampayId.trim()}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-gaming text-lg font-black uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{configSaving ? 'Saving...' : 'Save FamPay ID'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB: HL GAMING FREE FIRE OFFICIAL API */}
            {activeTab === 'hlgaming' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-gaming text-xl font-bold uppercase text-white">
                      HL Gaming Official Free Fire API
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live account verification service used to fetch in-game nickname, level, likes, and guild before diamond top-up.
                  </p>
                </div>

                {/* API Credentials Card */}
                <div className="bg-[#121622] rounded-xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      API Credentials
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        hlConfigured
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {hlConfigured ? 'Keys Configured (Active)' : 'Not Configured (Fallback Mode)'}
                    </span>
                  </div>

                  {hlSaveMsg && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{hlSaveMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveHlConfig} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                        Developer User UID (<code className="text-orange-400">useruid</code>)
                      </label>
                      <input
                        type="text"
                        required
                        value={hlUseruid}
                        onChange={(e) => setHlUseruid(e.target.value)}
                        placeholder="Your unique developer UID from dashboard"
                        className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                        Secret API Key (<code className="text-orange-400">api</code>)
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={hlApiKey}
                          onChange={(e) => setHlApiKey(e.target.value)}
                          placeholder="Paste your HL Gaming secret API key"
                          className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none"
                        />
                        <Key className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Endpoint: <code className="text-slate-400">https://proapis.hlgamingofficial.com/main/games/freefire/account/api</code>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={hlSaving || !hlUseruid.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-gaming text-base font-black uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>{hlSaving ? 'Saving...' : 'Save HL Gaming Credentials'}</span>
                    </button>
                  </form>
                </div>

                {/* Live Test Lookup Section */}
                <div className="bg-[#121622] rounded-xl p-5 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Live Free Fire Player UID Lookup Test
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">sectionName=AllData</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={testUid}
                        onChange={(e) => setTestUid(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter Player UID (e.g. 9351564274)"
                        className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2 px-3 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <select
                        value={testRegion}
                        onChange={(e) => setTestRegion(e.target.value)}
                        className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                      >
                        <option value="ind">India (ind)</option>
                        <option value="bd">Bangladesh (bd)</option>
                        <option value="pk">Pakistan (pk)</option>
                        <option value="sg">Singapore (sg)</option>
                        <option value="br">Brazil (br)</option>
                        <option value="id">Indonesia (id)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={testLoading || !testUid.trim()}
                    onClick={handleTestPlayerLookup}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
                    <span>{testLoading ? 'Querying HL Gaming API...' : 'Test Player Lookup'}</span>
                  </button>

                  {/* Test Result Display */}
                  {testResult && (
                    <div className="mt-3 p-3.5 bg-[#080b11] border border-slate-800 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase text-[11px]">Lookup Result:</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            testResult.success
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {testResult.success ? 'Success' : 'Error'}
                        </span>
                      </div>

                      {testResult.player ? (
                        <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                          <div className="bg-[#121622] p-2 rounded">
                            <span className="text-[10px] text-slate-400 block">Nickname:</span>
                            <span className="font-gaming font-bold text-amber-300 text-sm">
                              {testResult.player.name || 'Not Found'}
                            </span>
                          </div>
                          <div className="bg-[#121622] p-2 rounded">
                            <span className="text-[10px] text-slate-400 block">Level:</span>
                            <span className="font-mono font-bold text-white">
                              {testResult.player.level ? `Lvl ${testResult.player.level}` : 'N/A'}
                            </span>
                          </div>
                          <div className="bg-[#121622] p-2 rounded">
                            <span className="text-[10px] text-slate-400 block">Likes:</span>
                            <span className="font-mono text-cyan-400 font-bold">
                              {testResult.player.likes ? `${testResult.player.likes} 👍` : 'N/A'}
                            </span>
                          </div>
                          <div className="bg-[#121622] p-2 rounded">
                            <span className="text-[10px] text-slate-400 block">Server:</span>
                            <span className="font-mono text-orange-400 font-bold">
                              {testResult.player.region || testRegion.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-red-400 text-xs">
                          {testResult.message || 'No player data returned'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ADMIN SECURITY (CHANGE PIN) */}
            {activeTab === 'security' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-md mx-auto space-y-5">
                <div>
                  <h4 className="font-gaming text-xl font-bold uppercase text-white mb-1">
                    Change Admin PIN
                  </h4>
                  <p className="text-xs text-slate-400">
                    Update the passcode required to access this store management portal.
                  </p>
                </div>

                {pinChangeMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pinChangeMsg}</span>
                  </div>
                )}

                {pinChangeErr && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs">
                    {pinChangeErr}
                  </div>
                )}

                <form onSubmit={handleChangePin} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">
                      Current Admin PIN
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="Enter current PIN (default: admin123)"
                      className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">
                      New Admin PIN
                    </label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter new PIN (min 4 characters)"
                      className="w-full bg-[#0a0d14] border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-gaming text-base font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-700"
                  >
                    Update Passcode
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
