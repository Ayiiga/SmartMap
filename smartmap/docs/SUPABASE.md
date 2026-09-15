# Supabase CLI — Smart Map remote project

Project ref: `vhgqzdxkjmsomclyrchv`  
Project URL: `https://vhgqzdxkjmsomclyrchv.supabase.co`

## 1. Environment variables

Copy and fill `.env.local`:

```bash
cp .env.example .env.local
```

Required for the Next.js app:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Dashboard → Settings → API Keys → Publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API Keys → Secret (server only) |

The publishable key (`sb_publishable_...`) replaces the legacy `anon` key.

## 2. Supabase CLI setup

```bash
# Install CLI (or use npx)
npm install -g supabase

# Authenticate (opens browser or use token)
supabase login

# From smartmap/ directory
cd smartmap
supabase init          # already done if config.toml exists
supabase link --project-ref vhgqzdxkjmsomclyrchv
# Enter your database password when prompted

# Apply migrations
supabase db push
```

Or use the helper script:

```bash
export SUPABASE_DB_PASSWORD='your-db-password'
chmod +x scripts/setup-supabase.sh
./scripts/setup-supabase.sh
```

## 3. Manual migration (alternative)

If CLI link is not available, run the SQL in Supabase Dashboard → SQL Editor:

```
supabase/migrations/001_initial_schema.sql
```

## 4. Verify connection

```bash
curl "https://vhgqzdxkjmsomclyrchv.supabase.co/auth/v1/health" \
  -H "apikey: YOUR_PUBLISHABLE_KEY"
```

Expected: JSON with `"name":"GoTrue"`.

## 5. Auth settings (Dashboard)

Enable **Email** provider under Authentication → Providers.  
Optional: disable email confirmation for development.

## Direct Postgres connection

```
postgresql://postgres:[YOUR-PASSWORD]@db.vhgqzdxkjmsomclyrchv.supabase.co:5432/postgres
```

Use this password only for CLI/migrations — never commit it or expose it in client code.
