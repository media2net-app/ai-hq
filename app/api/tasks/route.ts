import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { addTaskToQueue } from '@/lib/queue'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const createTaskSchema = z.object({
  projectId: z.string(),
  prompt: z.string().min(1),
})

// GET /api/tasks - List tasks with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(status && { status: status as any }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        logs: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task from prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createTaskSchema.parse(body)

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        prompt: data.prompt,
        status: 'PENDING',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Add task to queue for background processing
    await addTaskToQueue(task.id).catch((error) => {
      console.error('Failed to add task to queue:', error)
      // Update task status to failed if queue fails
      prisma.task.update({
        where: { id: task.id },
        data: { status: 'FAILED', error: 'Failed to add to queue' },
      }).catch(console.error)
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

