# Carefinder

A civic health tool that helps Nigerians find, export, and share hospital information.

## Features

- **Hospital Search & Map** — Search by name, city, or LGA; filter by specialty and ownership; radius search with geolocation; Mapbox interactive map
- **CSV Export** — Client-side export with selectable columns via PapaParse
- **Share** — Human-readable shareable URLs and email sharing via Resend
- **Role-Based Auth** — Supabase Auth with RLS; admin-only writes; invite-only admin registration
- **Markdown Admin Editor** — React-MD-Editor for hospital descriptions with sanitized public rendering
- **Ratings & Reviews** — Logged-in users submit reviews; admins moderate; public read

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend / DB | Supabase (Postgres + PostGIS) |
| Auth | Supabase Auth + RLS |
| Map | Mapbox GL JS |
| CSV | PapaParse |
| Email | Resend API |
| Markdown | @uiw/react-md-editor |
| Deployment | Vercel |

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your keys
npm run dev
```

The app runs in **demo mode** with mock hospital data when Supabase is not configured.

### Supabase Setup

1. Create a Supabase project and enable the PostGIS extension
2. Run migrations: `supabase db push` or apply `supabase/migrations/001_initial_schema.sql`
3. Seed data: `supabase/seed.sql`
4. Deploy edge functions: `invite-admin`, `share-hospitals`
5. Create the first admin manually in the dashboard, then add a `user_roles` row with `role = 'admin'`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_MAPBOX_TOKEN` | Mapbox access token |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit + component tests (Vitest) |
| `npm run test:e2e` | Run Playwright E2E tests |

## Testing

- **Unit tests** (4+): CSV export, PostGIS distance, search filters, Markdown sanitization
- **Component tests** (4+): HospitalCard, SearchBar, AdminEntryForm, RatingWidget
- **E2E tests** (5+): Search, CSV export, share link, admin redirect, public access
- **RLS tests**: `supabase/tests/rls.test.ts` (requires live Supabase + test user)

## Project Structure

```
src/
  components/     # UI components (search, map, export, share, admin)
  pages/          # Route pages
  lib/            # Utilities (search, CSV, PostGIS, markdown, validation)
  hooks/          # React hooks
  contexts/       # Auth context
supabase/
  migrations/     # Database schema + RLS + PostGIS functions
  functions/      # Edge functions (invite-admin, share-hospitals)
  tests/          # RLS policy verification
e2e/              # Playwright E2E tests
```

## Deployment

Deploy to Vercel and set environment variables in the project settings. Deploy Supabase edge functions separately via the Supabase CLI.
