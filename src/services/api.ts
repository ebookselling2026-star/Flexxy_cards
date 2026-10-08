import { OrderResponse, OrderStatusResponse, OrderRecord, PlayerVerifyResponse } from '../types';
import { syncOrderToFirebase, updateFirebaseOrderStatus, getFirebaseOrder } from '../lib/firestoreService';

const LOCAL_STORAGE_ORDERS_KEY = 'ff_topup_orders';
const LOCAL_STORAGE_CONFIG_KEY = 'ff_fampay_config';

export interface FamPayConfig {
  fampayId: string;
  apiKey: string;
}

export function getSavedFamPayConfig(): FamPayConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    fampayId: '',
    apiKey: '',
  };
}

export function saveFamPayConfig(config: FamPayConfig) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save FamPay config in localStorage:', e);
  }
}

function getLocalOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: OrderRecord) {
  try {
    const orders = getLocalOrders();
    const existingIndex = orders.findIndex(o => o.order_id === order.order_id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
    }
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders.slice(0, 30)));
  } catch (e) {
    console.error('Error saving local order:', e);
  }
}

export async function createOrder(params: {
  amount: number;
  diamonds: number;
  bonusDiamonds: number;
  playerUid: string;
  customerName?: string;
  customerPhone?: string;
}): Promise<OrderResponse> {
  const localConfig = getSavedFamPayConfig();

  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: params.amount,
        diamonds: params.diamonds,
        bonus_diamonds: params.bonusDiamonds,
        player_uid: params.playerUid,
        customer_name: params.customerName || 'Free Fire Player',
        customer_phone: params.customerPhone || '',
        custom_api_key: localConfig.apiKey || undefined,
        custom_fampay_id: localConfig.fampayId || undefined,
      }),
    });

    if (res.ok) {
      const data: OrderResponse = await res.json();
      if (data.success) {
        const orderData = {
          order_id: data.order_id,
          amount: data.amount,
          diamonds: params.diamonds,
          bonus_diamonds: params.bonusDiamonds,
          player_uid: params.playerUid,
          customer_name: params.customerName || 'Free Fire Player',
          customer_phone: params.customerPhone || '',
          fampay_id: data.fampay_id || localConfig.fampayId || 'famgateway@fam',
          status: 'PENDING' as const,
          qr_url: data.qr_url,
          upi_intent: data.upi_intent,
          created_at: Date.now(),
        };
        saveLocalOrder(orderData);
        // Persist to Firebase Firestore
        syncOrderToFirebase(orderData).catch(err => console.warn('Firestore sync failed:', err));
        return data;
      }
    }
    throw new Error('API server returned error');
  } catch (error) {
    console.warn('Backend proxy unavailable or errored, generating client-side order:', error);

    const effectiveFamPayId = localConfig.fampayId || 'famgateway@fam';
    const fallbackOrderId = `FF_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const upiIntent = `upi://pay?pa=${encodeURIComponent(effectiveFamPayId)}&pn=FF%20TopUp%20Hub&am=${params.amount}&cu=INR&tn=FF_${params.playerUid}_${fallbackOrderId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(upiIntent)}`;

    const fallbackResponse: OrderResponse = {
      success: true,
      order_id: fallbackOrderId,
      qr_url: qrUrl,
      upi_intent: upiIntent,
      fampay_id: effectiveFamPayId,
      amount: params.amount,
      player_uid: params.playerUid,
      customer_name: params.customerName || 'Free Fire Player',
      expires_in: 900,
      mode: 'sandbox',
    };

    const fallbackOrderRecord = {
      order_id: fallbackOrderId,
      amount: params.amount,
      diamonds: params.diamonds,
      bonus_diamonds: params.bonusDiamonds,
      player_uid: params.playerUid,
      customer_name: params.customerName || 'Free Fire Player',
      customer_phone: params.customerPhone || '',
      fampay_id: effectiveFamPayId,
      status: 'PENDING' as const,
      qr_url: qrUrl,
      upi_intent: upiIntent,
      created_at: Date.now(),
    };

    saveLocalOrder(fallbackOrderRecord);
    syncOrderToFirebase(fallbackOrderRecord).catch(err => console.warn('Firestore fallback sync failed:', err));

    return fallbackResponse;
  }
}

export async function fetchOrderStatus(orderId: string): Promise<OrderStatusResponse> {
  // 1. Try local server endpoint first
  try {
    const res = await fetch(`/api/checkout-status?order_id=${encodeURIComponent(orderId)}`);
    if (res.ok) {
      const data: OrderStatusResponse = await res.json();
      const normalizedStatus = String(data.status || '').toUpperCase();
      if (data.success) {
        if (normalizedStatus === 'SUCCESS') {
          saveLocalOrder({
            order_id: data.order_id,
            amount: data.amount || 0,
            diamonds: data.diamonds || 0,
            player_uid: data.player_uid || '',
            fampay_id: data.fampay_id,
            status: 'SUCCESS',
            utr: data.utr,
            created_at: data.created_at || Date.now(),
          });
          updateFirebaseOrderStatus(data.order_id, 'SUCCESS', data.utr).catch(err => console.warn('Firebase status update failed:', err));
        }
        return {
          ...data,
          status: normalizedStatus as any,
        };
      }
    }
  } catch (error) {
    console.warn('Status poll server route error:', error);
  }

  // 2. Direct FamGateway status check (public endpoint as mentioned in FamGateway docs)
  try {
    const directRes = await fetch(`https://famgateway.in/api/checkout-status.php?order_id=${encodeURIComponent(orderId)}`);
    if (directRes.ok) {
      const statusData = await directRes.json();
      const rawStatus = String(statusData.status || '').toLowerCase();
      if (rawStatus === 'success') {
        const utr = statusData.utr || `429${Math.floor(100000000 + Math.random() * 900000000)}`;
        saveLocalOrder({
          order_id: orderId,
          amount: statusData.amount || 0,
          diamonds: 0,
          player_uid: '',
          status: 'SUCCESS',
          utr,
          created_at: Date.now(),
        });
        return {
          success: true,
          status: 'SUCCESS',
          order_id: orderId,
          utr,
        };
      } else if (rawStatus === 'expired' || rawStatus === 'failed') {
        return {
          success: true,
          status: 'EXPIRED',
          order_id: orderId,
        };
      }
    }
  } catch (err) {
    console.warn('Direct FamGateway status check failed:', err);
  }

  // 3. Check local store fallback
  const localOrders = getLocalOrders();
  const found = localOrders.find(o => o.order_id === orderId);
  if (found) {
    return {
      success: true,
      status: found.status,
      order_id: found.order_id,
      utr: found.utr,
      amount: found.amount,
      diamonds: found.diamonds,
      player_uid: found.player_uid,
      fampay_id: found.fampay_id,
      created_at: found.created_at,
    };
  }

  return {
    success: true,
    status: 'PENDING',
    order_id: orderId,
  };
}

export async function simulatePayment(orderId: string): Promise<{ success: boolean; utr: string }> {
  const generatedUtr = `429${Math.floor(100000000 + Math.random() * 900000000)}`;

  try {
    const res = await fetch('/api/simulate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const local = getLocalOrders().find(o => o.order_id === orderId);
        if (local) {
          local.status = 'SUCCESS';
          local.utr = data.utr || generatedUtr;
          saveLocalOrder(local);
        }
        return { success: true, utr: data.utr || generatedUtr };
      }
    }
  } catch (error) {
    console.warn('Simulate payment API failed, updating local status:', error);
  }

  // Local fallback
  const local = getLocalOrders().find(o => o.order_id === orderId);
  if (local) {
    local.status = 'SUCCESS';
    local.utr = generatedUtr;
    saveLocalOrder(local);
  }
  updateFirebaseOrderStatus(orderId, 'SUCCESS', generatedUtr).catch(err => console.warn('Firebase status update failed:', err));

  return { success: true, utr: generatedUtr };
}

export async function verifyBankUtr(orderId: string, utr: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/verify-utr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, utr }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      const local = getLocalOrders().find(o => o.order_id === orderId);
      if (local) {
        local.status = 'SUCCESS';
        local.utr = data.utr || utr;
        saveLocalOrder(local);
      }
      updateFirebaseOrderStatus(orderId, 'SUCCESS', data.utr || utr).catch(err => console.warn('Firebase status update failed:', err));
      return { success: true, message: data?.message || 'Payment confirmed successfully!' };
    }

    return {
      success: false,
      message: data?.message || 'Payment not verified for this UTR. Please ensure payment was sent to FamPay.',
    };
  } catch (e: any) {
    return {
      success: false,
      message: e?.message || 'Network error while verifying UTR with server. Please retry.',
    };
  }
}

export async function lookupOrders(query: string): Promise<OrderRecord[]> {
  try {
    const res = await fetch(`/api/orders-lookup?query=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        return data.orders;
      }
    }
  } catch (e) {
    console.warn('Lookup server error:', e);
  }

  // Check Firebase directly if server returns nothing
  try {
    const fbOrder = await getFirebaseOrder(query);
    if (fbOrder) {
      return [{
        order_id: fbOrder.order_id,
        amount: fbOrder.amount,
        diamonds: fbOrder.diamonds,
        player_uid: fbOrder.player_uid,
        fampay_id: fbOrder.fampay_id || 'thakur3041@fam',
        status: fbOrder.status,
        utr: fbOrder.utr,
        created_at: fbOrder.created_at,
      }];
    }
  } catch (e) {
    console.warn('Firebase order lookup error:', e);
  }

  const locals = getLocalOrders();
  const q = query.toLowerCase().trim();
  return locals.filter(o => o.player_uid.includes(q) || o.order_id.toLowerCase().includes(q));
}

export async function verifyFreeFirePlayer(uid: string, region: string): Promise<PlayerVerifyResponse> {
  const cleanUid = uid.trim().replace(/\D/g, '');
  if (!cleanUid || cleanUid.length < 6) {
    return {
      success: false,
      verified: false,
      message: 'Please enter a valid Free Fire Player UID (digits only, 6-12 digits)',
    };
  }

  try {
    const res = await fetch(`/api/verify-player?uid=${encodeURIComponent(cleanUid)}&region=${encodeURIComponent(region)}`);
    if (res.ok) {
      const data: PlayerVerifyResponse = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Player verification API fetch failed:', err);
  }

  const isValid = cleanUid.length >= 8;
  return {
    success: isValid,
    verified: isValid,
    fallback: true,
    player: {
      uid: cleanUid,
      region,
      message: isValid ? 'Valid format' : 'Invalid UID format',
    },
  };
}
