import { NextRequest, NextResponse } from 'next/server'
import { fetchOrganizationRepos } from '@/lib/github'

// Lazy load Prisma to avoid initialization errors
async function getPrisma() {
  try {
    const prismaModule = await import('@/lib/prisma')
    return prismaModule.prisma
  } catch (error) {
    console.warn('Prisma not available:', error)
    return null
  }
}

// POST /api/github/sync - Sync repositories from GitHub organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const org = body.org || 'media2net-app'

    // Fetch repositories from GitHub
    const repos = await fetchOrganizationRepos(org)

    // TODO: Get userId from session/auth
    const userId = '46466c3f-a639-4925-a74b-d397772639d9' // Default user

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      // Return GitHub repos without database sync
      return NextResponse.json({
        success: true,
        synced: 0,
        message: 'Database not available, returning GitHub repos only',
        repositories: repos.map((r) => ({
          name: r.name,
          description: r.description,
          githubRepo: r.fullName,
        })),
      })
    }

    const syncedProjects = []
    const errors = []

    for (const repo of repos) {
      try {
        // Check if project already exists
        const existing = await prismaClient.project.findFirst({
          where: {
            githubRepo: repo.fullName,
            userId,
          },
        })

        if (existing) {
          // Update existing project
          const updated = await prismaClient.project.update({
            where: { id: existing.id },
            data: {
              name: repo.name,
              description: repo.description,
              githubRepo: repo.fullName,
            },
          })
          syncedProjects.push({ action: 'updated', project: updated })
        } else {
          // Create new project
          const created = await prismaClient.project.create({
            data: {
              name: repo.name,
              description: repo.description,
              githubRepo: repo.fullName,
              userId,
            },
          })
          syncedProjects.push({ action: 'created', project: created })
        }
      } catch (error: any) {
        errors.push({
          repo: repo.fullName,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedProjects.length,
      errors: errors.length,
      details: {
        created: syncedProjects.filter((p) => p.action === 'created').length,
        updated: syncedProjects.filter((p) => p.action === 'updated').length,
        errors,
      },
    })
  } catch (error: any) {
    console.error('Error syncing GitHub repos:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync repositories',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// GET /api/github/sync - Get sync status or list of repos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const org = searchParams.get('org') || 'media2net-app'

    // Fetch repositories from GitHub (without syncing)
    const repos = await fetchOrganizationRepos(org)

    return NextResponse.json({
      organization: org,
      count: repos.length,
      repositories: repos,
    })
  } catch (error: any) {
    console.error('Error fetching GitHub repos:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch repositories',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
