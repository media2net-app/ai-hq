# Vercel Deployment Guide

## 🔧 Build Configuration

De `vercel.json` en `package.json` zijn geconfigureerd voor Vercel deployment.

## 📋 Environment Variables

Configureer deze environment variables in Vercel Dashboard:

### Vereist:
```env
DATABASE_URL="postgresql://postgres:L2raFCnbBrpnBaPn@db.kwfyehmszybxvsjyunkk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

### Optioneel (voor volledige functionaliteit):
```env
# GitHub
GITHUB_TOKEN="your-github-token"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"

# Vercel
VERCEL_TOKEN="your-vercel-token"

# NextAuth
NEXTAUTH_URL="https://ai-hq.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# Redis (optioneel)
REDIS_URL="your-redis-url"
```

## 🚀 Deployment Stappen

1. **Push naar GitHub:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment"
   git push
   ```

2. **Configureer Environment Variables in Vercel:**
   - Ga naar: https://vercel.com/dashboard
   - Selecteer je project: `ai-hq`
   - Ga naar **Settings** → **Environment Variables**
   - Voeg alle vereiste variabelen toe

3. **Redeploy:**
   - Ga naar **Deployments**
   - Klik op **Redeploy** bij de laatste deployment

## ⚠️ Bekende Beperkingen op Vercel

### System Monitoring
- System monitoring (CPU/Memory) werkt niet op Vercel (serverless)
- De API retourneert mock data op Vercel
- Werkt alleen lokaal

### Background Worker
- Worker process kan niet draaien op Vercel (serverless)
- Gebruik Vercel Cron Jobs of externe worker service
- Of gebruik Vercel Edge Functions

### Git Operations
- Repository cloning werkt niet op Vercel (geen file system access)
- Gebruik GitHub API voor file operations
- Of gebruik externe service voor git operations

## 🔍 Troubleshooting

### Build Fails: "Prisma Client not generated"
**Oplossing:** `postinstall` script is toegevoegd aan `package.json` om Prisma automatisch te genereren.

### Build Fails: "Module not found"
**Oplossing:** Check of alle dependencies in `package.json` staan.

### Runtime Error: "DATABASE_URL not set"
**Oplossing:** Configureer `DATABASE_URL` in Vercel Environment Variables.

### Runtime Error: "systeminformation not available"
**Oplossing:** Dit is normaal op Vercel. System monitoring werkt alleen lokaal.

## 📝 Vercel Dashboard

- **Project:** https://vercel.com/media2net-apps-projects/ai-hq
- **Deployments:** https://vercel.com/media2net-apps-projects/ai-hq/deployments
- **Settings:** https://vercel.com/media2net-apps-projects/ai-hq/settings
