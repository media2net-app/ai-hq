# AI-HQ - Agentic Workflow Platform

Een platform waarbij je via een webinterface prompts kunt invoeren, en AI agents automatisch werk uitvoeren op je projecten (GitHub repos, Vercel deployments).

## 🚀 Features

- **Project Management**: Maak en beheer projecten gekoppeld aan GitHub en Vercel
- **Task Creation**: Voer prompts in via een eenvoudige webinterface
- **Real-time Updates**: Volg de voortgang van tasks in real-time via Server-Sent Events
- **Task Logs**: Bekijk gedetailleerde logs van elke task
- **Status Tracking**: Volg de status van alle tasks (Pending, In Progress, Completed, Failed)

## 📋 Vereisten

- Node.js 18+ 
- PostgreSQL database (lokaal of via Supabase/Neon)
- GitHub account (voor repository integraties)
- Vercel account (voor deployment integraties)

## 🛠️ Setup

1. **Clone en installeer dependencies:**
   ```bash
   npm install
   ```

2. **Database configureren:**
   - Maak een `.env` bestand aan
   - Voeg je `DATABASE_URL` toe:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/aihq?schema=public"
     ```

3. **Database schema aanmaken:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Development server starten:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structuur

```
AI-HQ/
├── app/
│   ├── api/              # API routes
│   │   ├── projects/     # Project endpoints
│   │   └── tasks/        # Task endpoints
│   ├── projects/         # Project pages
│   ├── tasks/            # Task pages
│   └── page.tsx          # Dashboard
├── components/           # React components
├── lib/                  # Utilities (Prisma client, etc.)
├── prisma/              # Database schema
└── ARCHITECTURE.md      # Gedetailleerde architectuur
```

## 🔄 Workflow

1. **Project aanmaken**: Maak een nieuw project en koppel het aan een GitHub repo en/of Vercel project
2. **Task starten**: Voer een prompt in op de project pagina
3. **Monitoring**: Volg de voortgang in real-time op de task detail pagina
4. **Resultaten**: Bekijk logs en resultaten wanneer de task is voltooid

## 🚧 Toekomstige Features

- [ ] Authentication met NextAuth.js
- [ ] GitHub API integratie voor automatische commits
- [ ] Vercel API integratie voor deployments
- [ ] AI Agent execution engine (Cursor API of OpenAI)
- [ ] Background worker systeem met queue
- [ ] Multi-agent workflows
- [ ] Task templates
- [ ] Analytics dashboard

## 📝 API Endpoints

### Projects
- `GET /api/projects` - Lijst alle projecten
- `POST /api/projects` - Maak nieuw project
- `GET /api/projects/[id]` - Project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Verwijder project

### Tasks
- `GET /api/tasks` - Lijst tasks (met filters)
- `POST /api/tasks` - Maak nieuwe task
- `GET /api/tasks/[id]` - Task details
- `GET /api/tasks/[id]/status` - SSE endpoint voor real-time updates

## 🔐 Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_TOKEN=your-github-token
VERCEL_TOKEN=your-vercel-token
```

## 📄 License

ISC
