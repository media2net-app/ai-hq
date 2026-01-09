import { NextResponse } from 'next/server'
import { fetchOrganizationRepos } from '@/lib/github'

// GET /api/projects/sync - Automatically sync projects from GitHub
export async function GET() {
  try {
    const org = 'media2net-app'

    // Fetch repositories from GitHub
    const repos = await fetchOrganizationRepos(org)

    // Return repositories directly (without database for now)
    // TODO: Add database sync when Prisma is properly configured
    const projects = repos.map((repo) => ({
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

    return NextResponse.json({
      success: true,
      synced: projects.length,
      projects,
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
