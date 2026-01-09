# AI-HQ - Agentic Workflow Platform

Een volledig geautomatiseerd platform waarbij je via een webinterface prompts kunt invoeren, en AI agents automatisch werk uitvoeren op je projecten (GitHub repos, Vercel deployments).

## 🚀 Features

### ✅ Geïmplementeerd

- **GitHub Integratie**: Automatische synchronisatie van repositories
- **Project Management**: Beheer projecten gekoppeld aan GitHub en Vercel
- **Task Creation**: Voer prompts in via een eenvoudige webinterface
- **AI Agent Engine**: Volledige AI-powered code generatie en editing
- **Background Worker**: Queue-based task processing met BullMQ
- **Real-time Updates**: Volg de voortgang van tasks in real-time via Server-Sent Events
- **Task Logs**: Bekijk gedetailleerde logs van elke task
- **Status Tracking**: Volg de status van alle tasks (Pending, In Progress, Completed, Failed)
- **System Monitor**: Real-time CPU en geheugen monitoring met live grafieken
- **GitHub Operations**: Automatische cloning, file editing, commits en pushes
- **Vercel Integratie**: Automatische deployment triggers
- **Authentication**: NextAuth.js met GitHub OAuth

## 📋 Vereisten

- Node.js 18+
- PostgreSQL database (lokaal of via Supabase/Neon)
- Redis (optioneel, voor queue - valt terug op in-memory)
- GitHub account (voor repository integraties)
- Vercel account (voor deployment integraties)
- OpenAI API key (voor AI agent)

## 🛠️ Setup

### 1. Clone en installeer dependencies

```bash
npm install
```

### 2. Environment variabelen configureren

Maak een `.env` bestand aan met:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aihq?schema=public"

# Redis (optioneel)
REDIS_URL="redis://localhost:6379"
# OF
REDIS_HOST="localhost"
REDIS_PORT="6379"

# GitHub
GITHUB_TOKEN="your-github-personal-access-token"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"

# Vercel
VERCEL_TOKEN="your-vercel-api-token"

# NextAuth
NEXTAUTH_URL="http://localhost:7500"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 3. Database schema aanmaken

```bash
npm run db:push
npm run db:generate
```

### 4. Development server starten

**Terminal 1 - Main server:**
```bash
npm run dev
```

**Terminal 2 - Worker process:**
```bash
npm run dev:worker
```

### 5. Open in browser

```
http://localhost:7500
```

## 🔄 Workflow

1. **GitHub Sync**: Projecten worden automatisch gesynchroniseerd bij page load
2. **Task starten**: Ga naar een project en voer een prompt in
3. **AI Processing**: De AI agent analyseert de prompt, genereert code en voert acties uit
4. **GitHub Commit**: Changes worden automatisch gecommit en gepusht
5. **Vercel Deploy**: Deployment wordt automatisch getriggerd (indien geconfigureerd)
6. **Monitoring**: Volg de voortgang in real-time op de task detail pagina

## 📁 Project Structuur

```
AI-HQ/
├── app/
│   ├── api/
│   │   ├── auth/              # NextAuth routes
│   │   ├── projects/          # Project endpoints
│   │   ├── tasks/             # Task endpoints
│   │   ├── vercel/            # Vercel integration
│   │   └── system/            # System monitoring
│   ├── projects/              # Project pages
│   ├── tasks/                 # Task pages
│   └── page.tsx               # Dashboard
├── components/                # React components
├── lib/
│   ├── agent/                 # AI Agent execution engine
│   ├── git.ts                 # Git operations
│   ├── github.ts              # GitHub API
│   ├── vercel.ts              # Vercel API
│   ├── queue.ts               # Background worker queue
│   └── prisma.ts              # Database client
├── scripts/
│   └── worker.ts              # Worker process
└── prisma/                    # Database schema
```

## 🎯 Core Componenten

### AI Agent Engine
- Prompt analyse met OpenAI
- Code generatie en editing
- File system operations
- Automatic validation

### Background Worker
- Queue-based processing met BullMQ
- Retry logic en error handling
- Real-time status updates

### GitHub Operations
- Repository cloning/updating
- File read/write operations
- Automatic commits en pushes
- Branch management

### Vercel Integration
- Deployment triggers
- Status monitoring
- Environment variables

## 📝 API Endpoints

### Projects
- `GET /api/projects` - Lijst alle projecten
- `POST /api/projects` - Maak nieuw project
- `GET /api/projects/[id]` - Project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Verwijder project
- `GET /api/projects/sync` - Sync met GitHub

### Tasks
- `GET /api/tasks` - Lijst tasks (met filters)
- `POST /api/tasks` - Maak nieuwe task
- `GET /api/tasks/[id]` - Task details
- `POST /api/tasks/[id]/execute` - Execute task
- `GET /api/tasks/[id]/status` - SSE endpoint voor real-time updates

### Vercel
- `POST /api/vercel/deploy` - Trigger deployment
- `GET /api/vercel/deploy?deploymentId=xxx` - Get deployment status

## 🔐 Authentication

Het platform gebruikt NextAuth.js met GitHub OAuth. 

1. Maak een GitHub OAuth App: https://github.com/settings/developers
2. Voeg `GITHUB_CLIENT_ID` en `GITHUB_CLIENT_SECRET` toe aan `.env`
3. Set callback URL: `http://localhost:7500/api/auth/callback/github`

## 🚀 Production Deployment

### Vercel
1. Push naar GitHub
2. Import project in Vercel
3. Configureer environment variables
4. Deploy

### Database
- Gebruik Supabase of Neon voor PostgreSQL
- Configureer `DATABASE_URL` in Vercel

### Redis
- Gebruik Upstash Redis voor production
- Configureer `REDIS_URL` in Vercel

### Worker Process
- Gebruik Vercel Cron of een separate worker service
- Of run worker als separate process op je server

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm run dev:worker` - Start worker process (development)
- `npm run worker` - Start worker process (production)
- `npm run build` - Build voor production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run memory:analyze` - Analyseer geheugengebruik
- `npm run memory:cleanup` - Cleanup oude Node processen

## 📊 Monitoring

- **System Monitor**: Real-time CPU en geheugen monitoring
- **Task Logs**: Gedetailleerde logs per task
- **Queue Status**: Monitor queue via BullMQ dashboard (optioneel)

## 🔧 Troubleshooting

### Database connectie problemen
- Check `DATABASE_URL` in `.env`
- Zorg dat PostgreSQL draait
- Run `npm run db:push` opnieuw

### Redis connectie problemen
- Redis is optioneel - systeem valt terug op in-memory queue
- Voor production, gebruik Upstash Redis

### Worker process start niet
- Check of Redis draait (als geconfigureerd)
- Check logs voor errors
- Zorg dat `OPENAI_API_KEY` is geconfigureerd

### GitHub operations falen
- Check `GITHUB_TOKEN` permissions
- Zorg dat token `repo` scope heeft
- Check repository permissions

## 📄 License

ISC
