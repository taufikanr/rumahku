# RumahKu — Supabase setup

The app runs on seed data until these env vars are set, then automatically
switches to the live Supabase database.

## 1. Create a free project
1. Go to <https://supabase.com> → **New project**.
2. Region: **Southeast Asia (Singapore)** (closest to Sabah).
3. Set a database password (save it somewhere).
4. Wait ~2 minutes for provisioning.

## 2. Get your keys
Project → **Settings → API**:
- **Project URL**
- **anon / public** key (safe for the browser)
- **service_role** key (⚠️ secret — server-only, used once for seeding)

## 3. Add `.env.local` (in `rumahku-app/`)
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
`.env.local` is gitignored — never commit it.

## 4. Create the database tables
Supabase dashboard → **SQL Editor** → paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql) → **Run**.

## 5. Seed the data + demo accounts
```
npm run seed
```
This creates the demo accounts, landlord profiles, and the Kota Kinabalu listings.

## Demo accounts (after seeding)
| Role | Email | Password |
| --- | --- | --- |
| Tenant | `tenant@demo.rumahku.my` | `rumahku123` |
| Landlord | `landlord@demo.rumahku.my` | `rumahku123` |
