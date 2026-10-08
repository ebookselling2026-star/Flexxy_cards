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
