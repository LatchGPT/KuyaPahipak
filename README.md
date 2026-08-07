# Kuya Pahipak

Production-ready Next.js 15+ vape inventory and customer rewards platform.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Firebase Authentication + Firestore + Firebase Storage
- Recharts + Framer Motion

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
   ```
3. Run:
   ```bash
   npm run dev
   ```

## Firestore Collections
- `admins` (doc id = admin email)
- `customers`
- `brands`
- `flavors`
- `inventory`
- `sales`
- `claims`
- `settings`

## Core Behaviors
- Public homepage includes split product catalog, modal flavor browsing, stock visibility, and rewards tracker.
- Admin-only login (single account via `admins` collection and/or `NEXT_PUBLIC_ADMIN_EMAIL`).
- Purchases and free pod claims are transaction-safe and block negative inventory.
- Reward logic supports stockpiled claimable pods (`totalPurchased / 10 - redeemed`) with progress as modulo 10.
- Real-time updates from Firestore snapshot listeners.
- Daily/weekly/monthly report export as Excel-compatible `.xls` files.
