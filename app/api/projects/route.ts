import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  githubRepo: z.string().optional(),
  vercelProjectId: z.string().optional(),
})

// GET /api/projects - List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createProjectSchema.parse(body)

    // TODO: Get userId from session/auth
    const userId = 'temp-user-id' // Replace with actual auth

    const project = await prisma.project.create({
      data: {
        ...data,
        userId,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
