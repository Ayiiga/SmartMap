# Deploy Smart Map to Cloudflare (local)

The Cloud Agent VM **cannot reach** `api.cloudflare.com` or `github.com` (TLS blocked). Verify tokens and deploy from your machine.

## 1. Verify Cloudflare token

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/76ab741d1c4f937e97167a05a9063c00/tokens/verify" \
  -H "Authorization: Bearer YOUR_CF_API_TOKEN"
```

Success looks like:

```json
{
  "success": true,
  "result": { "id": "...", "status": "active" }
}
```

Account ID (already in `wrangler.jsonc`): `76ab741d1c4f937e97167a05a9063c00`

## 2. Configure environment

```bash
cd smartmap
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.

export CLOUDFLARE_API_TOKEN=your_token_here
export CLOUDFLARE_ACCOUNT_ID=76ab741d1c4f937e97167a05a9063c00
```

## 3. Deploy

```bash
npm ci
./scripts/deploy-cloudflare.sh
# or: npm run deploy
```

Worker URL after deploy: `https://smartmap.<your-subdomain>.workers.dev`

## 4. Post-deploy

1. Set `NEXT_PUBLIC_APP_URL` to the Workers URL (GitHub Actions secret or `.env.local`).
2. Supabase Dashboard → Authentication → URL configuration:
   - Site URL: your Workers URL
   - Redirect: `https://smartmap.<subdomain>.workers.dev/auth/callback`

## Security

Never paste API tokens in chat or commit them. If a token was exposed, revoke it at  
[Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens) and create a new one.
