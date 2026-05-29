# RumahKu — Sabah's Trusted Rental App

RumahKu is a two-sided rental marketplace for **Sabah** (launching in Kota Kinabalu),
built to fix the scams, deposit disputes, and housemate mismatches that plague the
informal rental channels Sabahans rely on today (Facebook groups, WhatsApp, Mudah).

Built as the MVP for **KD04503 Technopreneurship** at **Universiti Malaysia Sabah** by **Group 10**.

## ✨ Features

- 🔎 **Verified listing search** with filters (area, price, distance to UMS, gender, sort)
- 🛡️ **Scam detector** — scores every listing for risk and explains why
- ⚖️ **Price-fairness check** vs the area average for that property type
- 👥 **Housemate compatibility matching** + tenant reviews & ratings
- ❤️ **Saved listings**
- 🔐 **Auth** with tenant / landlord roles (Supabase, Row-Level-Security secured)
- 🏠 **Landlord dashboard** + post-a-listing form with a **live scam preview**
- 🧾 **Digital tenancy-agreement generator** (live document → print / save as PDF / store)
- 💡 **Bill tracker** with due dates and status

## 🧱 Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn / Base UI ·
Supabase (Postgres + Auth + RLS) · deployed on Vercel.

## 🚀 Local setup

1. `npm install`
2. Set up Supabase — see **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**, then create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # only used by the seed script
   ```
3. Run `supabase/schema.sql` in the Supabase SQL editor (creates tables + RLS + trigger).
4. `npm run seed` — seeds demo accounts + Kota Kinabalu listings, reviews, and bills.
5. `npm run dev` → http://localhost:3000

## 👤 Demo accounts (password: `rumahku123`)

| Role | Email |
| --- | --- |
| Tenant | `tenant@demo.rumahku.my` |
| Landlord | `landlord@demo.rumahku.my` |

## 📜 Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run seed` — seed the Supabase database

---

A KD04503 Technopreneurship MVP · **Group 10** · Universiti Malaysia Sabah.
