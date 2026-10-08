import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { OrderRecord } from '../types';

export interface FirebaseOrderData {
  order_id: string;
  amount: number;
  diamonds: number;
  bonus_diamonds?: number;
  player_uid: string;
  customer_name?: string;
  customer_phone?: string;
  fampay_id?: string;
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED';
  utr?: string;
  qr_url?: string;
  upi_intent?: string;
  created_at: number;
  updated_at?: any;
}

const ORDERS_COLLECTION = 'orders';

/**
 * Save or sync an order directly to Firebase Firestore
 */
export async function syncOrderToFirebase(order: Partial<OrderRecord> & { order_id: string }): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.order_id);
    const dataToSave: Record<string, any> = {
      order_id: order.order_id,
      amount: order.amount ?? 0,
      diamonds: order.diamonds ?? 0,
      bonus_diamonds: order.bonus_diamonds ?? 0,
      player_uid: order.player_uid ?? '',
      customer_name: order.customer_name ?? 'Free Fire Player',
      customer_phone: order.customer_phone ?? '',
      fampay_id: order.fampay_id ?? '',
      status: order.status ?? 'PENDING',
      created_at: order.created_at ?? Date.now(),
      updated_at: serverTimestamp(),
    };

    if (order.utr) dataToSave.utr = order.utr;
    if (order.qr_url) dataToSave.qr_url = order.qr_url;
    if (order.upi_intent) dataToSave.upi_intent = order.upi_intent;

    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error('Error syncing order to Firebase Firestore:', error);
  }
}

/**
 * Update order status and UTR in Firebase Firestore
 */
export async function updateFirebaseOrderStatus(
  orderId: string,
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED',
  utr?: string
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: Record<string, any> = {
      status,
      updated_at: serverTimestamp(),
    };
    if (utr) {
      updateData.utr = utr;
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating order status in Firebase:', error);
  }
}

/**
 * Get an order by ID from Firestore
 */
export async function getFirebaseOrder(orderId: string): Promise<FirebaseOrderData | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirebaseOrderData;
    }
  } catch (error) {
    console.error('Error fetching order from Firebase:', error);
  }
  return null;
}

/**
 * Query orders by ID or Player UID from Firestore across all devices
 */
export async function queryOrdersByPlayerOrId(searchQuery: string): Promise<FirebaseOrderData[]> {
  const clean = searchQuery.trim();
  if (!clean) return [];

  try {
    // 1. Try single order by exact ID
    const single = await getFirebaseOrder(clean);
    if (single) return [single];

    // 2. Query by player_uid
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('player_uid', '==', clean),
      limit(20)
    );
    const snap = await getDocs(q);
    const results: FirebaseOrderData[] = [];
    snap.forEach((d) => {
      results.push(d.data() as FirebaseOrderData);
    });
    if (results.length > 0) return results;

    // 3. Fallback scan recent orders for partial match
    const recent = await getFirebaseOrders(50);
    const lower = clean.toLowerCase();
    return recent.filter((o) =>
      o.order_id.toLowerCase().includes(lower) ||
      o.player_uid.includes(clean) ||
      (o.customer_phone && o.customer_phone.includes(clean))
    );
  } catch (err) {
    console.warn('Error querying orders in Firestore:', err);
    return [];
  }
}

/**
 * Fetch recent orders from Firestore (for Admin or Live feeds)
 */
export async function getFirebaseOrders(maxOrders = 50): Promise<FirebaseOrderData[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('created_at', 'desc'),
      limit(maxOrders)
    );
    const snap = await getDocs(q);
    const orders: FirebaseOrderData[] = [];
    snap.forEach((d) => {
      orders.push(d.data() as FirebaseOrderData);
    });
    return orders;
  } catch (error) {
    console.error('Error querying orders from Firebase:', error);
    return [];
  }
}

/**
 * Subscribe to real-time order updates for tracking
 */
export function subscribeToFirebaseOrder(
  orderId: string,
  onUpdate: (order: FirebaseOrderData) => void
): () => void {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as FirebaseOrderData);
      }
    });
  } catch (err) {
    console.warn('Real-time subscription error:', err);
    return () => {};
  }
}

/**
 * Real-time subscription to all recent orders (for Admin Portal across all devices)
 */
export function subscribeToAllOrders(
  onUpdate: (orders: FirebaseOrderData[]) => void,
  maxOrders = 100
): () => void {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('created_at', 'desc'),
      limit(maxOrders)
    );
    return onSnapshot(q, (snapshot) => {
      const orders: FirebaseOrderData[] = [];
      snapshot.forEach((d) => {
        orders.push(d.data() as FirebaseOrderData);
      });
      onUpdate(orders);
    });
  } catch (err) {
    console.warn('Error subscribing to all orders:', err);
    return () => {};
  }
}

const SETTINGS_COLLECTION = 'settings';

export interface FirebaseGatewayConfig {
  fampayId: string;
  apiKey?: string;
  updated_at?: any;
}

/**
 * Save FamPay UPI ID and Gateway Config to Firebase (instantly reflects on all devices)
 */
export async function saveGatewayConfigToFirebase(config: { fampayId: string; apiKey?: string }): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'gateway_config');
    await setDoc(
      docRef,
      {
        fampayId: config.fampayId,
        apiKey: config.apiKey || '',
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving gateway config to Firebase:', error);
  }
}

/**
 * Get FamPay UPI ID and Gateway Config from Firebase
 */
export async function getGatewayConfigFromFirebase(): Promise<FirebaseGatewayConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'gateway_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirebaseGatewayConfig;
    }
  } catch (error) {
    console.error('Error fetching gateway config from Firebase:', error);
  }
  return null;
}

/**
 * Subscribe to FamPay UPI ID in real-time across all devices
 */
export function subscribeToGatewayConfig(
  onUpdate: (config: FirebaseGatewayConfig) => void
): () => void {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'gateway_config');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as FirebaseGatewayConfig);
      }
    });
  } catch (err) {
    console.warn('Real-time gateway config subscription error:', err);
    return () => {};
  }
}

/**
 * Save Admin Passcode to Firebase (so new passcode works across all devices immediately)
 */
export async function saveAdminPinToFirebase(pin: string): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'admin_auth');
    await setDoc(
      docRef,
      {
        pin: pin.trim(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving admin pin to Firebase:', error);
  }
}

/**
 * Get Admin Passcode from Firebase
 */
export async function getAdminPinFromFirebase(): Promise<string | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'admin_auth');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.pin) {
        return String(data.pin).trim();
      }
    }
  } catch (error) {
    console.error('Error fetching admin pin from Firebase:', error);
  }
  return null;
}

/**
 * Save HL Gaming Free Fire API credentials to Firebase
 */
export async function saveHlGamingConfigToFirebase(config: { useruid: string; api?: string }): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'hl_gaming');
    await setDoc(
      docRef,
      {
        useruid: config.useruid.trim(),
        api: config.api ? config.api.trim() : '',
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving HL Gaming config to Firebase:', error);
  }
}

/**
 * Get HL Gaming Free Fire API credentials from Firebase
 */
export async function getHlGamingConfigFromFirebase(): Promise<{ useruid: string; api?: string } | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'hl_gaming');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as { useruid: string; api?: string };
    }
  } catch (error) {
    console.error('Error fetching HL Gaming config from Firebase:', error);
  }
  return null;
}
