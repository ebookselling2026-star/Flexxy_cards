export interface TopUpPackage {
  id: string;
  amount: number;
  diamonds: number;
  bonusDiamonds: number;
  originalPrice: number;
  badge?: string;
  badgeType?: 'popular' | 'mega' | 'hot' | 'starter';
  description: string;
  popular?: boolean;
  bestValue?: boolean;
  image: string;
}

export type PaymentMethod = 'fampay_upi';

export interface CheckoutFormData {
  playerUid: string;
  region: string;
  ign: string;
  buyerName?: string;
  phone: string;
  paymentMethod: PaymentMethod;
}

export interface OrderResponse {
  success: boolean;
  order_id: string;
  qr_url: string;
  upi_intent: string;
  amount: number;
  player_uid: string;
  customer_name: string;
  fampay_id?: string;
  upi_id?: string;
  expires_in?: number;
  mode?: string;
  message?: string;
}

export interface OrderStatusResponse {
  success: boolean;
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED' | 'success' | 'pending' | 'failed' | 'expired';
  order_id: string;
  utr?: string;
  amount?: number;
  diamonds?: number;
  player_uid?: string;
  fampay_id?: string;
  created_at?: number;
  message?: string;
}

export interface OrderRecord {
  order_id: string;
  amount: number;
  diamonds: number;
  bonus_diamonds?: number;
  player_uid: string;
  customer_name?: string;
  customer_phone?: string;
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED';
  fampay_id?: string;
  utr?: string;
  qr_url?: string;
  upi_intent?: string;
  created_at: number;
}

export interface PlayerVerifyResponse {
  success: boolean;
  verified: boolean;
  notFoundInGame?: boolean;
  player?: {
    uid: string;
    name?: string;
    level?: number;
    likes?: number;
    guild?: string;
    region?: string;
    brRankPoint?: number;
    csRankPoint?: number;
    message?: string;
  };
  message?: string;
  fallback?: boolean;
}
