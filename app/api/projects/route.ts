import { NextRequest, NextResponse } from 'next/server'
import { fetchOrganizationRepos } from '@/lib/github'

// Lazy load Prisma to avoid initialization errors
let prisma: any = null
let getServerSession: any = null
let authOptions: any = null

async function getPrisma() {
  if (!prisma) {
    try {
      const prismaModule = await import('@/lib/prisma')
      prisma = prismaModule.prisma
    } catch (error) {
      console.warn('Prisma not available:', error)
    }
  }
  return prisma
}

async function getAuth() {
  if (!getServerSession || !authOptions) {
    try {
      const authModule = await import('next-auth')
      const authRoute = await import('@/app/api/auth/[...nextauth]/route')
      getServerSession = authModule.getServerSession
      authOptions = authRoute.authOptions
    } catch (error) {
      console.warn('Auth not available:', error)
    }
  }
  return { getServerSession, authOptions }
}

// GET /api/projects - List all projects (from GitHub, optionally sync with database)
export async function GET() {
  try {
    // Always fetch from GitHub first (primary source)
    const org = 'media2net-app'
    const repos = await fetchOrganizationRepos(org)

    // Transform to project format
    let projects = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      githubRepo: repo.fullName,
      language: repo.language,
      stars: repo.stars,
      updatedAt: repo.updatedAt,
      createdAt: repo.createdAt,
      _count: { tasks: 0 },
      tasks: [],
    }))

    // Try to sync with database if available (optional)
    try {
      const prismaClient = await getPrisma()
      if (!prismaClient) throw new Error('Prisma not available')

      const auth = await getAuth()
      const userId = auth.getServerSession && auth.authOptions
        ? (await auth.getServerSession(auth.authOptions))?.user?.id || '46466c3f-a639-4925-a74b-d397772639d9'
        : '46466c3f-a639-4925-a74b-d397772639d9' // Default to your user

      // Check if database is available
      await prismaClient.$connect()

      // Get projects from database
      const dbProjects = await prismaClient.project.findMany({
        where: { userId },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: { tasks: true },
          },
        },
      })

      // Merge GitHub data with database data (prefer database for tasks)
      projects = projects.map((ghProject) => {
        const dbProject = dbProjects.find((p) => p.githubRepo === ghProject.githubRepo)
        if (dbProject) {
          return {
            ...ghProject,
            id: dbProject.id, // Use database ID
            _count: dbProject._count,
            tasks: dbProject.tasks,
          }
        }
        return ghProject
      })

      // Create missing projects in database
      for (const repo of repos) {
        const exists = dbProjects.some((p) => p.githubRepo === repo.fullName)
        if (!exists) {
          try {
            await prismaClient.project.create({
              data: {
                name: repo.name,
                description: repo.description || '',
                githubRepo: repo.fullName,
                userId,
              },
            })
          } catch (error) {
            // Project might already exist, skip
            console.error(`Failed to create project ${repo.name}:`, error)
          }
        }
      }
    } catch (dbError: any) {
      // Database not available or error - continue with GitHub data only
      console.warn('Database not available, using GitHub data only:', dbError.message)
    }

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch projects',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
