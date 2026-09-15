# Google Sign-In Setup — Smart Map

## 1. Supabase Dashboard

### Enable Google provider
1. Open [Google provider settings](https://supabase.com/dashboard/project/vhgqzdxkjmsomclyrchv/auth/providers?provider=Google)
2. Toggle **Enable Sign in with Google**
3. Add **Client ID** and **Client Secret** from Google Cloud Console
4. Save

### URL configuration
1. Open [URL Configuration](https://supabase.com/dashboard/project/vhgqzdxkjmsomclyrchv/auth/url-configuration)
2. Set **Site URL**:
   - Dev: `http://localhost:3000`
   - Prod: your production domain
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://127.0.0.1:3000/auth/callback
   https://YOUR_PRODUCTION_DOMAIN/auth/callback
   ```

## 2. Google Cloud Console

1. Create OAuth 2.0 Client ID (Web application)
2. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `https://YOUR_PRODUCTION_DOMAIN`
3. **Authorized redirect URI** (Supabase):
   ```
   https://vhgqzdxkjmsomclyrchv.supabase.co/auth/v1/callback
   ```

## 3. Database migrations

Run in SQL Editor (in order):
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_google_oauth_profiles.sql`

## 4. Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vhgqzdxkjmsomclyrchv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-jwt
NEXT_PUBLIC_APP_URL=http://localhost:3000   # production URL when deployed
```

## 5. Test flow

```bash
cd smartmap && npm run dev
```

1. Visit http://localhost:3000/login
2. Click **Continue with Google**
3. After redirect, confirm header shows your name
4. Refresh — session persists
5. Click **Sign Out**

Full audit: `docs/GOOGLE_AUTH_AUDIT.md`
