# AI-HQ: Agentic Workflow Platform - Architectuur

## Overzicht
Een platform waarbij je via een webinterface prompts kunt invoeren, en AI agents automatisch werk uitvoeren op je projecten (GitHub repos, Vercel deployments).

## Stack Keuze

### Frontend & Backend
- **Next.js 14+** (App Router) - Full-stack framework
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library

### Database & State
- **PostgreSQL** (via Supabase of Neon) - Primaire database
- **Prisma** - ORM voor type-safe database access
- **Zustand** - Client-side state management

### Real-time & Queue
- **Server-Sent Events (SSE)** - Voor real-time status updates
- **BullMQ** of **Database Queue** - Voor background job processing
- **Vercel Cron** of **Inngest** - Voor scheduled tasks

### Integraties
- **GitHub API** - Repository management, commits, PRs
- **Vercel API** - Deployment management
- **OpenAI API** (of Cursor API indien beschikbaar) - AI agent execution
- **NextAuth.js** - Authentication

### Development Tools
- **ESLint** + **Prettier** - Code quality
- **Vitest** - Testing
- **Docker** (optioneel) - Local development

## Architectuur Flow

### 1. Prompt Invoer
```
User → Web Interface → API Route → Database (Project + Task)
```

### 2. Task Processing
```
Database Queue → Background Worker → AI Agent → Actions:
  - Code edits via file system
  - Git operations (commit, push)
  - Vercel deployments
  - Status updates
```

### 3. Status Updates
```
Background Worker → Database Update → SSE → Frontend (Real-time)
```

## Database Schema

### Projects
- id, name, description
- githubRepo, vercelProjectId
- createdAt, updatedAt

### Tasks
- id, projectId
- prompt (user input)
- status (pending, in_progress, completed, failed)
- result, error
- createdAt, updatedAt, completedAt

### TaskLogs
- id, taskId
- message, type (info, success, error)
- timestamp

### Agents
- id, name, description
- config (model, temperature, etc.)

## API Routes

### `/api/projects`
- GET - List projects
- POST - Create project
- GET `/[id]` - Get project details
- PATCH `/[id]` - Update project

### `/api/tasks`
- GET - List tasks (with filters)
- POST - Create task (from prompt)
- GET `/[id]` - Get task details + logs
- GET `/[id]/status` - SSE endpoint voor real-time updates

### `/api/agent/execute`
- POST - Execute agent task (internal, called by worker)

### `/api/github`
- POST `/webhook` - GitHub webhook handler
- GET `/repos` - List connected repos

### `/api/vercel`
- POST `/deploy` - Trigger deployment
- GET `/deployments` - List deployments

## Frontend Pages

### `/` - Dashboard
- Overview van alle projecten
- Recente tasks
- Quick actions

### `/projects`
- List alle projecten
- Create new project
- Project cards met status

### `/projects/[id]`
- Project details
- Task history
- Create new task (prompt input)

### `/tasks/[id]`
- Task details
- Real-time log viewer
- Status indicator

## Security

- Authentication via NextAuth.js
- API route protection (middleware)
- GitHub/Vercel tokens encrypted in database
- Rate limiting op API routes
- Input validation & sanitization

## Deployment

- **Vercel** - Frontend + API routes
- **Supabase/Neon** - PostgreSQL database
- **Upstash Redis** (optioneel) - Voor BullMQ queue
- **GitHub Actions** - CI/CD (optioneel)

## Workflow Voorbeeld

1. User logt in → Dashboard
2. Selecteert project → Project detail page
3. Voert prompt in: "Voeg een login pagina toe met email/password"
4. Task wordt aangemaakt (status: pending)
5. Background worker pakt task op
6. AI Agent analyseert prompt:
   - Bepaalt welke files nodig zijn
   - Genereert code
   - Test lokaal (indien mogelijk)
7. Agent voert acties uit:
   - Edits files
   - Commits naar GitHub
   - Triggers Vercel deployment
8. Status updates worden gestreamd naar frontend
9. User ziet real-time progress
10. Task completed → User krijgt notificatie

## Uitbreidingsmogelijkheden

- Multi-agent workflows (specialized agents)
- Task templates
- Project templates
- Team collaboration
- Analytics & insights
- Cost tracking (API usage)
- Custom agent configurations per project
