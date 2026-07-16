# 🏢 Uncle Sam's Apartment — Management System

Full-stack property management system for **Uncle Sam's Apartment**, Nyayo Gate B, Naivas Court, Embakasi, Nairobi.

**Stack:** Next.js 14 · TypeScript · Prisma · Supabase (PostgreSQL) · NextAuth · Tailwind CSS · Vercel

---

## Features

- **Dashboard** — occupancy stats, revenue vs target chart, recent payments
- **Units** — floor-based grid (bedsitters, 1-bed, 2-bed); unit naming `1F-1`, `2F-3` etc.
- **Tenants** — add, view history, move-out
- **Invoices** — manual create or bulk-generate for all tenants; rent + water + WiFi line items
- **Payments** — record M-Pesa (with transaction code), cash, bank transfer, cheque
- **Water Billing** — enter meter readings per unit; auto-calculates usage and charge
- **Expenses** — log property expenses by category with pie chart breakdown
- **Reports** — monthly revenue bar chart, occupancy by floor, arrears list, expense breakdown
- **Settings** — property details, billing defaults, password change

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Supabase — get from: supabase.com → Project Settings → Database → Connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Push schema & seed database

```bash
npm run db:push    # creates all tables in Supabase
npm run db:seed    # loads sample floors, units, tenants, invoices
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

**Login:** `unglesam@gmail.com` / `admin123`
> Change password immediately via Settings after first login.

---

## Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/uncle-sams-apt.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your repo
2. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase connection string |
| `NEXTAUTH_SECRET` | Your generated secret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

3. **Build command:** `prisma generate && next build` ← set this in Vercel project settings
4. Deploy ✅

### Step 3 — Seed production database

After first deploy, run from your local machine (with production `DATABASE_URL`):

```bash
npm run db:push
npm run db:seed
```

---

## Project Structure

```
uncle-sams-apt/
├── prisma/
│   ├── schema.prisma        # All database models
│   └── seed.ts              # Sample data (floors, units, tenants)
├── src/
│   ├── app/
│   │   ├── (auth)/login/    # Login page
│   │   ├── (dashboard)/     # All protected pages
│   │   │   ├── dashboard/   # Overview & stats
│   │   │   ├── units/       # Unit grid + detail
│   │   │   ├── tenants/     # Tenant list + detail
│   │   │   ├── invoices/    # Invoice management
│   │   │   ├── payments/    # Payment log
│   │   │   ├── water/       # Water meter billing
│   │   │   ├── expenses/    # Expense tracker
│   │   │   ├── reports/     # Analytics & charts
│   │   │   └── settings/    # App settings
│   │   └── api/             # REST API routes
│   ├── components/
│   │   ├── layout/          # Sidebar, TopBar
│   │   └── ui/              # Badge, Modal, Toast, etc.
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config
│   │   ├── db.ts            # Prisma client
│   │   └── utils.ts         # Formatters & helpers
│   └── types/               # TypeScript types
├── .env.example
├── tailwind.config.ts
├── vercel.json
└── README.md
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |

---

## Contact

Uncle Sam's Apartment · Nyayo Gate B, Naivas Court, Embakasi, Nairobi
📧 unglesam@gmail.com · 📱 0738 822 454
