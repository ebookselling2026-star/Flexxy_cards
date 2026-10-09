import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// CORS & Preflight headers
app.use((_req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  if (_req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Normalize /api prefix so requests work whether routed with or without /api by Vercel
app.use((req: Request, _res: Response, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/@') && !req.url.startsWith('/src')) {
    const knownEndpoints = [
      'create-order',
      'verify-player',
      'checkout-status',
      'verify-utr',
      'simulate-payment',
      'orders-lookup',
      'gateway-config',
      'webhook',
      'admin',
    ];
    const pathWithoutSlash = req.url.replace(/^\//, '').split('?')[0];
    if (knownEndpoints.some(ep => pathWithoutSlash.startsWith(ep))) {
      req.url = '/api' + req.url;
    }
  }
  next();
});

app.use(express.json());

// Dynamic Gateway Config & Admin Security
let adminPin = process.env.ADMIN_PIN || 'Gaurav3041';

const storageDir = isVercel ? os.tmpdir() : process.cwd();
const GATEWAY_CONFIG_FILE = path.join(storageDir, 'gateway_config.json');
const ORDERS_STORAGE_FILE = path.join(storageDir, 'orders_store.json');
const HL_CONFIG_FILE = path.join(storageDir, 'hl_config.json');

let configStore = {
  apiKey: process.env.FAMGATEWAY_API_KEY || '',
  fampayId: process.env.FAMPAY_UPI_ID || 'thakur3041@fam',
};

// Load stored FamGateway config if available
try {
  if (fs.existsSync(GATEWAY_CONFIG_FILE)) {
    const raw = fs.readFileSync(GATEWAY_CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.apiKey) configStore.apiKey = parsed.apiKey;
    if (parsed.fampayId) configStore.fampayId = parsed.fampayId;
  }
} catch (e) {
  console.warn('Could not read gateway_config.json:', e);
}

// HL Gaming Official Free Fire API Credentials
let hlGamingConfig = {
  useruid: process.env.HL_GAMING_USERUID || 'Hwjexp62zVM8HZB7cj8L8MUVTSp1',
  api: process.env.HL_GAMING_API_KEY || 'Nomxie0704MWk3ikyDJhaT9EyNZ1dK',
};

// Load stored HL Gaming config if available
try {
  if (fs.existsSync(HL_CONFIG_FILE)) {
    const raw = fs.readFileSync(HL_CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.useruid) hlGamingConfig.useruid = parsed.useruid;
    if (parsed.api) hlGamingConfig.api = parsed.api;
  }
} catch (e) {
  console.warn('Could not read hl_config.json:', e);
}

// In-memory store for generated orders
interface OrderRecord {
  order_id: string;
  amount: number;
  diamonds: number;
  bonus_diamonds: number;
  player_uid: string;
  customer_name: string;
  customer_phone: string;
  fampay_id: string;
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED';
  qr_url: string;
  upi_intent: string;
  utr?: string;
  created_at: number;
  expires_at: number;
}

const ordersStore = new Map<string, OrderRecord>();

// Load persisted orders
try {
  if (fs.existsSync(ORDERS_STORAGE_FILE)) {
    const raw = fs.readFileSync(ORDERS_STORAGE_FILE, 'utf-8');
    const ordersList: OrderRecord[] = JSON.parse(raw);
    if (Array.isArray(ordersList)) {
      ordersList.forEach(o => ordersStore.set(o.order_id, o));
    }
  }
} catch (e) {
  console.warn('Could not load orders_store.json:', e);
}

function persistOrders() {
  try {
    const list = Array.from(ordersStore.values());
    fs.writeFileSync(ORDERS_STORAGE_FILE, JSON.stringify(list.slice(-100), null, 2));
  } catch (e) {
    console.warn('Could not persist orders_store.json:', e);
  }
}

// Helper to generate realistic 12-digit UTR
function generateUTR(): string {
  const prefix = Math.floor(4000 + Math.random() * 5000);
  const suffix = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${suffix}`;
}

// Helper to extract `pa=` (Payee Address / UPI ID) from UPI Intent URI
function extractVpaFromIntent(intent?: string): string | null {
  if (!intent) return null;
  try {
    const match = intent.match(/[?&]pa=([^&]+)/i);
    if (match) return decodeURIComponent(match[1]);
  } catch {}
  return null;
}

// Admin: Login / Verify PIN
app.post('/api/admin/login', (req: Request, res: Response): void => {
  const { pin } = req.body;
  if (!pin || String(pin).trim() !== adminPin) {
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
    return;
  }
  res.json({ success: true, message: 'Admin authenticated' });
});

// Admin: Change PIN
app.post('/api/admin/change-pin', (req: Request, res: Response): void => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || String(currentPin).trim() !== adminPin) {
    res.status(401).json({ success: false, message: 'Current PIN is incorrect' });
    return;
  }
  if (!newPin || String(newPin).trim().length < 4) {
    res.status(400).json({ success: false, message: 'New PIN must be at least 4 characters' });
    return;
  }
  adminPin = String(newPin).trim();
  res.json({ success: true, message: 'Admin PIN updated successfully' });
});

// Admin: Get All Orders & Store Statistics
app.get('/api/admin/orders', (_req: Request, res: Response): void => {
  const orders = Array.from(ordersStore.values()).reverse();
  const totalRevenue = orders
    .filter((o) => o.status === 'SUCCESS')
    .reduce((sum, o) => sum + o.amount, 0);

  const stats = {
    totalOrders: orders.length,
    successOrders: orders.filter((o) => o.status === 'SUCCESS').length,
    pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
    expiredOrders: orders.filter((o) => o.status === 'EXPIRED').length,
    totalRevenue,
  };

  res.json({
    success: true,
    stats,
    orders,
    currentFamPayId: configStore.fampayId,
    apiKeyConfigured: Boolean(configStore.apiKey && configStore.apiKey.trim() !== ''),
    hlGamingConfigured: Boolean(hlGamingConfig.useruid && hlGamingConfig.api),
    hlGamingUseruid: hlGamingConfig.useruid,
  });
});

// Admin: Update HL Gaming API credentials
app.post('/api/admin/update-hl-config', (req: Request, res: Response): void => {
  const { useruid, api } = req.body;
  if (typeof useruid === 'string') hlGamingConfig.useruid = useruid.trim();
  if (typeof api === 'string') hlGamingConfig.api = api.trim();

  try {
    fs.writeFileSync(HL_CONFIG_FILE, JSON.stringify(hlGamingConfig, null, 2));
  } catch (e) {
    console.warn('Could not write hl_config.json:', e);
  }

  res.json({
    success: true,
    message: 'HL Gaming Free Fire API credentials updated',
    hlGamingConfigured: Boolean(hlGamingConfig.useruid && hlGamingConfig.api),
    useruid: hlGamingConfig.useruid,
  });
});

// Admin: Debug HL API live test
app.get('/api/admin/debug-hl-test', async (req: Request, res: Response): Promise<void> => {
  const uid = String(req.query.uid || '2469113941').trim();
  const region = String(req.query.region || 'ind').trim();
  const regionCode = normalizeRegionCode(region);
  const hlUrl = `https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid=${encodeURIComponent(uid)}&region=${encodeURIComponent(regionCode)}&useruid=${encodeURIComponent(hlGamingConfig.useruid)}&api=${encodeURIComponent(hlGamingConfig.api)}`;

  try {
    const upstreamRes = await fetch(hlUrl);
    const body = await upstreamRes.text();
    res.json({
      uid,
      regionCode,
      useruid: hlGamingConfig.useruid,
      apiLength: hlGamingConfig.api.length,
      apiKeyMasked: hlGamingConfig.api.slice(0, 4) + '****' + hlGamingConfig.api.slice(-4),
      status: upstreamRes.status,
      body,
    });
  } catch (err: any) {
    res.json({ error: err.message, stack: err.stack });
  }
});

// Helper: Normalize region for HL Gaming API (ind, pk, bd, sg, br, ru, id, tw, us, vn, th, me, cis)
function normalizeRegionCode(region?: string): string {
  if (!region) return 'ind';
  const r = region.toLowerCase();
  if (r.includes('bangladesh') || r.includes('bd')) return 'bd';
  if (r.includes('pakistan') || r.includes('pk')) return 'pk';
  if (r.includes('singapore') || r.includes('sea') || r.includes('sg')) return 'sg';
  if (r.includes('brazil') || r.includes('br')) return 'br';
  if (r.includes('indonesia') || r.includes('id')) return 'id';
  if (r.includes('vietnam') || r.includes('vn')) return 'vn';
  if (r.includes('thailand') || r.includes('th')) return 'th';
  if (r.includes('middle east') || r.includes('me')) return 'me';
  return 'ind';
}

// In-memory cache for verified Free Fire player profiles (saves API quota)
const playerProfilesCache = new Map<string, any>();

async function fetchPlayerFromHLMultiRegion(uid: string, primaryRegion: string): Promise<any | null> {
  if (!hlGamingConfig.useruid || !hlGamingConfig.api) return null;

  const candidateRegions = [primaryRegion];
  const others = ['ind', 'bd', 'pk', 'sg', 'br', 'id', 'me', 'th', 'vn'].filter(r => r !== primaryRegion);
  candidateRegions.push(...others);

  for (const reg of candidateRegions) {
    try {
      const hlUrl = `https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid=${encodeURIComponent(uid)}&region=${encodeURIComponent(reg)}&useruid=${encodeURIComponent(hlGamingConfig.useruid)}&api=${encodeURIComponent(hlGamingConfig.api)}`;
      const hlResponse = await fetch(hlUrl);
      if (!hlResponse.ok) continue;

      const rawText = await hlResponse.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {}

      if (!data || data.error) continue;

      const root = data.result || data.data || data;
      const accountInfo = root.AccountInfo || root.accountInfo || root.captainBasicInfo || root;
      const guildInfo = root.GuildInfo || root.guildInfo || {};
      const captainInfo = root.captainBasicInfo || {};

      const nickname =
        accountInfo.AccountName ||
        root.AccountName ||
        captainInfo.nickname ||
        root.nickname ||
        accountInfo.nickname;

      if (nickname) {
        const level =
          accountInfo.AccountLevel ||
          root.AccountLevel ||
          captainInfo.level ||
          root.level ||
          accountInfo.level ||
          70;

        const likes =
          accountInfo.AccountLikes !== undefined
            ? accountInfo.AccountLikes
            : root.AccountLikes !== undefined
            ? root.AccountLikes
            : captainInfo.liked !== undefined
            ? captainInfo.liked
            : 0;

        const guild =
          guildInfo.GuildName ||
          root.GuildName ||
          guildInfo.guildName ||
          undefined;

        const brRankPoint =
          accountInfo.BrRankPoint ||
          root.BrRankPoint ||
          captainInfo.rankingPoints;

        const csRankPoint = accountInfo.CsRankPoint || root.CsRankPoint;

        return {
          uid,
          name: nickname,
          level: Number(level),
          likes: Number(likes),
          guild: guild || undefined,
          region: (accountInfo.AccountRegion || reg).toUpperCase(),
          brRankPoint: brRankPoint ? Number(brRankPoint) : undefined,
          csRankPoint: csRankPoint ? Number(csRankPoint) : undefined,
        };
      }
    } catch (e) {
      console.warn(`HL lookup error for region ${reg}:`, e);
    }
  }

  return null;
}

// 0. Player UID Verification via HL Gaming Official Free Fire API
// GET /api/verify-player?uid=...&region=...
app.get('/api/verify-player', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUid = String(req.query.uid || '').trim();
    const uid = rawUid.replace(/\D/g, '');
    const regionParam = String(req.query.region || 'ind').trim();
    const regionCode = normalizeRegionCode(regionParam);

    if (!uid || uid.length < 6) {
      res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid Player UID format (digits only, min 6 digits)',
      });
      return;
    }

    // 1. Check in-memory cache first
    const cached = playerProfilesCache.get(uid);
    if (cached && cached.name) {
      res.json({
        success: true,
        verified: true,
        player: cached,
      });
      return;
    }

    // 2. Fetch live from HL Gaming API across primary & fallback regions
    const livePlayer = await fetchPlayerFromHLMultiRegion(uid, regionCode);
    if (livePlayer && livePlayer.name) {
      playerProfilesCache.set(uid, livePlayer);
      res.json({
        success: true,
        verified: true,
        player: livePlayer,
      });
      return;
    }

    // 3. If not found in game database (or API limit reached)
    // Return verified: true with prompt for player to enter/confirm their IGN
    res.json({
      success: true,
      verified: true,
      notFoundInGame: true,
      player: {
        uid,
        name: '',
        level: 70,
        likes: 0,
        region: regionCode.toUpperCase(),
      },
    });
  } catch (error) {
    console.error('Verify player error:', error);
    res.status(500).json({ success: false, verified: false, message: 'Server error verifying player' });
  }
});

// Admin: Update Order Status manually
app.post('/api/admin/update-order-status', (req: Request, res: Response): void => {
  const { order_id, status, utr } = req.body;
  if (!order_id || !status) {
    res.status(400).json({ success: false, message: 'order_id and status are required' });
    return;
  }

  const record = ordersStore.get(order_id);
  if (!record) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  record.status = status;
  if (utr) {
    record.utr = utr;
  } else if (status === 'SUCCESS' && !record.utr) {
    record.utr = generateUTR();
  }

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    order: record,
  });
});

// Gateway Config Endpoints
app.get('/api/gateway-config', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    apiKeyConfigured: Boolean(configStore.apiKey && configStore.apiKey.trim() !== ''),
    fampayId: configStore.fampayId,
  });
});

app.post('/api/gateway-config', (req: Request, res: Response): void => {
  const { apiKey, fampayId } = req.body;
  if (typeof apiKey === 'string') {
    configStore.apiKey = apiKey.trim();
  }
  if (typeof fampayId === 'string' && fampayId.trim() !== '') {
    configStore.fampayId = fampayId.trim();
  }

  try {
    fs.writeFileSync(GATEWAY_CONFIG_FILE, JSON.stringify(configStore, null, 2));
  } catch (e) {
    console.warn('Could not write gateway_config.json:', e);
  }

  res.json({
    success: true,
    message: 'FamGateway configuration updated successfully',
    apiKeyConfigured: Boolean(configStore.apiKey && configStore.apiKey.trim() !== ''),
    fampayId: configStore.fampayId,
  });
});

// 1. Order Creation Endpoint
// POST /api/create-order
app.post('/api/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      amount,
      customer_name,
      customer_phone,
      player_uid,
      diamonds,
      bonus_diamonds,
      custom_api_key,
      custom_fampay_id,
    } = req.body;

    if (!amount || !player_uid) {
      res.status(400).json({ success: false, message: 'Amount and Player UID are required' });
      return;
    }

    const effectiveApiKey = (custom_api_key || configStore.apiKey || '').trim();
    const effectiveFamPayId = (custom_fampay_id || configStore.fampayId || 'famgateway@fam').trim();

    const localOrderId = `FF_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    let externalData: any = null;

    // Call FamGateway API if API Key is configured
    if (effectiveApiKey) {
      try {
        const response = await fetch('https://famgateway.in/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': effectiveApiKey,
          },
          body: JSON.stringify({
            amount: Number(amount),
            customer_name: customer_name || 'Free Fire Player',
            customer_phone: customer_phone || '9999999999',
          }),
        });

        if (response.ok) {
          const rawJson = await response.json();
          // FamGateway returns: { status: "success", data: { order_id, qr_url, upi_intent, ... } }
          // or direct object
          externalData = rawJson.data || rawJson;
        } else {
          console.warn('FamGateway create-order non-OK status:', response.status);
        }
      } catch (err) {
        console.warn('FamGateway API connection error:', err);
      }
    }

    // Determine final Order ID
    const finalOrderId = externalData?.order_id || localOrderId;

    // Determine final UPI Intent
    let finalUpiIntent = externalData?.upi_intent || externalData?.intent_url || null;

    // Determine final FamPay / UPI ID
    const extractedVpa =
      externalData?.upi_id ||
      externalData?.vpa ||
      externalData?.fampay_id ||
      extractVpaFromIntent(finalUpiIntent) ||
      effectiveFamPayId;

    if (!finalUpiIntent) {
      const upiPayeeName = 'FF TopUp Hub';
      const upiNote = `FF_TOPUP_${player_uid}_${finalOrderId}`;
      finalUpiIntent = `upi://pay?pa=${encodeURIComponent(extractedVpa)}&pn=${encodeURIComponent(upiPayeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
    }

    // Determine final QR URL
    const finalQrUrl =
      externalData?.qr_url ||
      externalData?.qr_code ||
      `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(finalUpiIntent)}`;

    const orderRecord: OrderRecord = {
      order_id: finalOrderId,
      amount: Number(amount),
      diamonds: Number(diamonds) || 10000,
      bonus_diamonds: Number(bonus_diamonds) || 0,
      player_uid: String(player_uid),
      customer_name: customer_name || 'Survivor',
      customer_phone: customer_phone || '',
      fampay_id: extractedVpa,
      status: 'PENDING',
      qr_url: finalQrUrl,
      upi_intent: finalUpiIntent,
      created_at: Date.now(),
      expires_at: Date.now() + 15 * 60 * 1000,
    };

    ordersStore.set(finalOrderId, orderRecord);
    persistOrders();

    res.json({
      success: true,
      order_id: finalOrderId,
      qr_url: finalQrUrl,
      upi_intent: finalUpiIntent,
      fampay_id: extractedVpa,
      amount: Number(amount),
      player_uid: String(player_uid),
      customer_name: orderRecord.customer_name,
      expires_in: 900,
      mode: effectiveApiKey ? 'live' : 'sandbox',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while creating order' });
  }
});

// 2. Checkout Status Polling Endpoint
// GET /api/checkout-status?order_id=...
app.get('/api/checkout-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.query.order_id as string;

    if (!orderId) {
      res.status(400).json({ success: false, message: 'order_id parameter is required' });
      return;
    }

    const record = ordersStore.get(orderId);

    // If order already verified as SUCCESS in our store, return immediately
    if (record && record.status === 'SUCCESS') {
      res.json({
        success: true,
        status: 'SUCCESS',
        order_id: record.order_id,
        utr: record.utr,
        amount: record.amount,
        diamonds: record.diamonds,
        player_uid: record.player_uid,
        fampay_id: record.fampay_id,
      });
      return;
    }

    // A. Check FamGateway authenticated verification (triggers backend IMAP email sync)
    if (configStore.apiKey) {
      try {
        const verifyUrl = `https://famgateway.in/api/verify-order.php?api_key=${encodeURIComponent(configStore.apiKey)}&order_id=${encodeURIComponent(orderId)}`;
        const verifyRes = await fetch(verifyUrl, { signal: AbortSignal.timeout(3500) });
        if (verifyRes.ok) {
          const vData: any = await verifyRes.json();
          const vStatus = String(vData.status || '').toLowerCase();
          const isPaid = Boolean(vData.is_paid || vStatus === 'success');

          if (isPaid) {
            const finalUtr = vData.utr || vData.transaction_id || record?.utr || generateUTR();
            if (record) {
              record.status = 'SUCCESS';
              record.utr = finalUtr;
              persistOrders();
            }

            res.json({
              success: true,
              status: 'SUCCESS',
              order_id: orderId,
              utr: finalUtr,
              amount: vData.amount || record?.amount,
              diamonds: record?.diamonds,
              player_uid: record?.player_uid,
              fampay_id: record?.fampay_id,
            });
            return;
          } else if (vStatus === 'expired' || vStatus === 'failed') {
            if (record) {
              record.status = 'EXPIRED';
              persistOrders();
            }
            res.json({
              success: true,
              status: 'EXPIRED',
              order_id: orderId,
            });
            return;
          }
        }
      } catch (err) {
        // Fast timeout or network error, continue to fast checkout-status
      }
    }

    // B. Check external FamGateway API status directly (public endpoint)
    try {
      const response = await fetch(`https://famgateway.in/api/checkout-status.php?order_id=${encodeURIComponent(orderId)}`, { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const externalStatus = await response.json();
        const rawStatus = String(externalStatus.status || '').toLowerCase();

        if (rawStatus === 'success' || externalStatus.is_paid) {
          const utr = externalStatus.utr || externalStatus.transaction_id || record?.utr || generateUTR();
          if (record) {
            record.status = 'SUCCESS';
            record.utr = utr;
            persistOrders();
          }

          res.json({
            success: true,
            status: 'SUCCESS',
            order_id: orderId,
            utr,
            amount: externalStatus.amount || record?.amount,
            diamonds: record?.diamonds,
            player_uid: record?.player_uid,
            fampay_id: record?.fampay_id,
          });
          return;
        } else if (rawStatus === 'expired' || rawStatus === 'failed') {
          if (record) {
            record.status = 'EXPIRED';
            persistOrders();
          }
          res.json({
            success: true,
            status: 'EXPIRED',
            order_id: orderId,
          });
          return;
        }
      }
    } catch (err) {
      // Fall through to local store
    }

    // Check local store
    if (!record) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Check expiration (15 mins)
    if (Date.now() > record.expires_at && record.status === 'PENDING') {
      record.status = 'EXPIRED';
      persistOrders();
    }

    res.json({
      success: true,
      status: record.status,
      order_id: record.order_id,
      utr: record.utr,
      amount: record.amount,
      diamonds: record.diamonds,
      player_uid: record.player_uid,
      fampay_id: record.fampay_id,
      created_at: record.created_at,
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({ success: false, message: 'Internal error checking status' });
  }
});

// Webhook listener for automated merchant callbacks from FamGateway
app.post(['/api/webhook', '/api/webhook/famgateway'], (req: Request, res: Response): void => {
  try {
    const body = req.body || {};
    const orderId = body.order_id || body.data?.order_id;
    const utr = body.utr || body.data?.utr || body.transaction_id;
    const rawStatus = String(body.status || body.data?.status || '').toUpperCase();

    if (orderId) {
      const record = ordersStore.get(orderId);
      if (record) {
        if (rawStatus === 'SUCCESS' || body.is_paid || body.data?.is_paid) {
          record.status = 'SUCCESS';
          if (utr) record.utr = utr;
          persistOrders();
          console.log(`[FAMGATEWAY WEBHOOK] Order ${orderId} marked SUCCESS via webhook! UTR:`, utr);
        }
      }
    }
    res.json({ success: true, message: 'Webhook processed' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Test Payment Simulation (for testing sandbox / evaluation)
// POST /api/simulate-payment
app.post('/api/simulate-payment', (req: Request, res: Response): void => {
  const { order_id } = req.body;
  if (!order_id) {
    res.status(400).json({ success: false, message: 'order_id required' });
    return;
  }

  const record = ordersStore.get(order_id);
  if (!record) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  record.status = 'SUCCESS';
  record.utr = generateUTR();
  persistOrders();

  res.json({
    success: true,
    message: 'Payment simulated successfully',
    order_id: record.order_id,
    utr: record.utr,
    status: 'SUCCESS',
  });
});

// 4. Verify UTR endpoint (Strict bank reference check)
// POST /api/verify-utr
app.post('/api/verify-utr', async (req: Request, res: Response): Promise<void> => {
  const { order_id, utr } = req.body;
  if (!order_id || !utr) {
    res.status(400).json({ success: false, message: 'Order ID and UTR number are required.' });
    return;
  }

  const cleanUtr = String(utr).trim().replace(/\s+/g, '');

  // Strict format validation: Indian UPI UTR is 12 digits (or 8-16 alphanumeric characters)
  if (cleanUtr.length < 8 || cleanUtr.length > 18 || !/^[0-9a-zA-Z]+$/.test(cleanUtr)) {
    res.status(400).json({
      success: false,
      message: 'Invalid UTR format. Please enter the valid 12-digit UPI Reference Number / Bank UTR from your payment receipt.',
    });
    return;
  }

  // Reject obvious fake/dummy repeating strings
  if (/^(\d)\1{7,}$/.test(cleanUtr) || cleanUtr === '123456789012' || cleanUtr === '012345678901' || cleanUtr === '000000000000') {
    res.status(400).json({
      success: false,
      message: 'Fake or dummy UTR detected. Please enter your real 12-digit UPI Ref / UTR from PhonePe, Google Pay, or Paytm.',
    });
    return;
  }

  const record = ordersStore.get(order_id);
  if (!record) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  // If order already verified as SUCCESS
  if (record.status === 'SUCCESS') {
    res.json({
      success: true,
      message: 'Payment already verified as SUCCESS',
      order_id: record.order_id,
      utr: record.utr || cleanUtr,
      status: 'SUCCESS',
    });
    return;
  }

  // REAL LIVE VERIFICATION WITH FAMGATEWAY
  // 1. Trigger instant IMAP email sync with FamGateway using merchant API key
  let paymentConfirmed = false;
  let detectedUtr = cleanUtr;

  if (configStore.apiKey) {
    try {
      const verifyUrl = `https://famgateway.in/api/verify-order.php?api_key=${encodeURIComponent(configStore.apiKey)}&order_id=${encodeURIComponent(order_id)}`;
      const verifyRes = await fetch(verifyUrl);
      if (verifyRes.ok) {
        const vData: any = await verifyRes.json();
        const vStatus = String(vData.status || '').toLowerCase();
        if (vData.is_paid || vStatus === 'success') {
          paymentConfirmed = true;
          if (vData.utr) detectedUtr = vData.utr;
        }
      }
    } catch (e) {
      console.warn('verify-order.php error during UTR check:', e);
    }
  }

  // 2. Also check public checkout-status.php
  if (!paymentConfirmed) {
    try {
      const pubRes = await fetch(`https://famgateway.in/api/checkout-status.php?order_id=${encodeURIComponent(order_id)}`);
      if (pubRes.ok) {
        const pubData: any = await pubRes.json();
        if (String(pubData.status || '').toLowerCase() === 'success' || pubData.is_paid) {
          paymentConfirmed = true;
          if (pubData.utr) detectedUtr = pubData.utr;
        }
      }
    } catch (e) {}
  }

  // If payment was verified by FamGateway
  if (paymentConfirmed) {
    record.status = 'SUCCESS';
    record.utr = detectedUtr;
    persistOrders();

    res.json({
      success: true,
      message: 'Payment confirmed successfully!',
      order_id: record.order_id,
      utr: record.utr,
      status: 'SUCCESS',
    });
    return;
  }

  // PAYMENT NOT VERIFIED BY FAMGATEWAY - REJECT!
  res.status(400).json({
    success: false,
    verified: false,
    message: `Payment not verified yet for UTR "${cleanUtr}". FamPay has not detected a ₹${record.amount} payment to ${record.fampay_id} for this order. If you just completed the payment, please wait 30-60 seconds for FamPay email synchronization, then try again.`,
  });
});

// 5. Track Order / Lookup by Player UID or Order ID
// GET /api/orders-lookup?query=...
app.get('/api/orders-lookup', (req: Request, res: Response): void => {
  const query = String(req.query.query || '').trim();
  if (!query) {
    res.status(400).json({ success: false, message: 'Query required' });
    return;
  }

  const results: any[] = [];
  ordersStore.forEach((order) => {
    if (order.player_uid === query || order.order_id.toLowerCase() === query.toLowerCase()) {
      results.push({
        order_id: order.order_id,
        amount: order.amount,
        diamonds: order.diamonds,
        player_uid: order.player_uid,
        fampay_id: order.fampay_id,
        status: order.status,
        utr: order.utr,
        created_at: order.created_at,
      });
    }
  });

  res.json({ success: true, orders: results.reverse() });
});

// Start Server with Vite Middleware in dev or static in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FF TopUp Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the standalone HTTP listener if not running as a Vercel serverless function
if (!isVercel) {
  startServer();
}

export default app;
