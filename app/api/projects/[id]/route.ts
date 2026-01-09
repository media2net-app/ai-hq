import { NextRequest, NextResponse } from 'next/server'

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

// GET /api/projects/[id] - Get project details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }
    const project = await prismaClient.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            logs: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }
    const body = await request.json()

    const project = await prismaClient.project.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }
    await prismaClient.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
