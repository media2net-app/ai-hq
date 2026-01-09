# Supabase Database Setup

## Connection String

Voor Prisma heb je een PostgreSQL connection string nodig. Supabase biedt dit aan in de dashboard.

### Stap 1: Haal Database Password op

1. Ga naar je Supabase project: https://supabase.com/dashboard/project/kwfyehmszybxvsjyunkk
2. Ga naar **Settings** → **Database**
3. Scroll naar **Connection string** sectie
4. Kies **URI** tab
5. Kopieer de connection string (ziet eruit als):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.kwfyehmszybxvsjyunkk.supabase.co:5432/postgres
   ```

### Stap 2: Voeg toe aan .env

Voeg deze regel toe aan je `.env` bestand:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kwfyehmszybxvsjyunkk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Let op:** Vervang `[YOUR-PASSWORD]` met je echte database password.

### Stap 3: Push Schema naar Database

```bash
npm run db:push
npm run db:generate
```

## Alternatief: Direct Connection (zonder pgbouncer)

Als je direct connection wilt (voor migrations):

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kwfyehmszybxvsjyunkk.supabase.co:5432/postgres"
```

## Supabase Dashboard

- **Project URL:** https://kwfyehmszybxvsjyunkk.supabase.co
- **API Key:** sb_publishable_l4lhX5DdhQcgZ0MM9-T2EQ_4ldIdAs8

Deze API key kan gebruikt worden voor Supabase REST API calls (optioneel).
