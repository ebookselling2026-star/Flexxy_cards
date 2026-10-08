# Flexxy Cards - Free Fire Diamonds Top-Up Store

Production-ready, high-conversion Free Fire Diamond Top-Up store with dark cyberpunk terminal UI, FamPay UPI dynamic QR integration, instant UID validation, WhatsApp dispatch, and hidden Admin Portal.

---

## 🚀 One-Click Deploy to Vercel

1. Push this repository to your **GitHub** account.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will auto-detect as **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**!

---

## ⚙️ Environment Variables (Optional in Vercel Settings)

In your Vercel Project Dashboard under **Settings -> Environment Variables**, you can add:

| Key | Description | Default |
|---|---|---|
| `FAMPAY_UPI_ID` | Your official FamPay UPI ID (e.g. `thakur3041@fam`) | `thakur3041@fam` |
| `FAMGATEWAY_API_KEY` | FamGateway v2.0 API Key for automated bank sync | *(optional)* |
| `ADMIN_PIN` | Secure PIN to access `/admin` portal | `admin123` |
| `HL_GAMING_USERUID` | HL Gaming useruid for live FF account lookup | `Hwjexp62zVM8HZB7cj8L8MUVTSp1` |
| `HL_GAMING_API_KEY` | HL Gaming API Key | *(optional)* |

*Note: The website works 100% out-of-the-box even without configuring any environment variables, thanks to built-in fallbacks and client-side storage.*

---

## 🔒 Admin Portal Access

The admin portal lock icons have been removed from the public UI for security. To access your admin dashboard:

1. Simply open `/admin` or `#admin` in your browser:
   ```text
   https://your-vercel-domain.vercel.app/admin
   ```
2. Enter your PIN (Default: `admin123`).
3. You can:
   - Update your active FamPay UPI ID
   - Change your Admin PIN
   - View live transaction history, revenue stats, and customer UTRs
   - Update order status (Pending / Success)
   - Configure live HL Gaming Free Fire API keys

---

## 📲 WhatsApp Customer Support & Order Notification

- Customer orders automatically open WhatsApp with the exact receipt and player UID to WhatsApp: **`+91 9286520702`**.
- Message format:
  ```text
  Hello, I am [Buyer Name] I purchased [Plan Name] of ₹[Amount] and my Free Fire UID is [Player UID]. Here is my payment receipt/UTR. Please verify and credit.
  ```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local server (Express + Vite on port 3000)
npm run dev

# Run type check
npm run lint

# Production build
npm run build
```
