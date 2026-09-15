# Push Smart Map to GitHub (local)

## Token requirements

The GitHub PAT must allow **Contents: Read and write** on `Ayiiga/Smart Map`.

- **Fine-grained token:** Repository access → `Ayiiga/Smart Map` → Permissions → **Contents: Read and write**
- **Classic token:** scope `repo`

If push fails with `403` or `Resource not accessible by personal access token`, regenerate the token with Contents write.

## Push from GitLab clone

```bash
git clone https://gitlab.com/ayiiga3-group/vibepay.git
cd vibepay
git checkout main
export GITHUB_TOKEN=your_pat_with_contents_write
./scripts/push-github.sh
```

Target: **https://github.com/Ayiiga/Smart Map**

## After push

1. GitHub → **Settings → Secrets and variables → Actions**
2. Add secrets from `smartmap/docs/DEPLOY_VERCEL.md` or `DEPLOY_GITHUB_CLOUDFLARE.md`
3. Vercel (recommended): connect repo, root directory `smartmap`
