import { NextRequest, NextResponse } from 'next/server'
import { addTaskToQueue } from '@/lib/queue'
import { prisma } from '@/lib/prisma'

// POST /api/tasks/[id]/execute - Add task to queue for execution
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    if (task.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Task is not in PENDING status' },
        { status: 400 }
      )
    }

    // Add to queue
    const job = await addTaskToQueue(taskId)

    return NextResponse.json({
      success: true,
      taskId,
      jobId: job.id,
      message: 'Task added to queue',
    })
  } catch (error: any) {
    console.error('Error executing task:', error)
    return NextResponse.json(
      {
        error: 'Failed to execute task',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
