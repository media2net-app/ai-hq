import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id]/status - SSE endpoint for real-time status updates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      // Send initial connection message
      send(JSON.stringify({ type: 'connected', taskId: params.id }))

      // Poll for updates every 2 seconds
      const interval = setInterval(async () => {
        try {
          const task = await prisma.task.findUnique({
            where: { id: params.id },
            include: {
              logs: {
                orderBy: { timestamp: 'desc' },
                take: 10,
              },
            },
          })

          if (task) {
            send(
              JSON.stringify({
                type: 'update',
                status: task.status,
                logs: task.logs,
                result: task.result,
                error: task.error,
              })
            )

            // Close stream if task is completed or failed
            if (task.status === 'COMPLETED' || task.status === 'FAILED') {
              clearInterval(interval)
              send(JSON.stringify({ type: 'complete' }))
              controller.close()
            }
          }
        } catch (error) {
          console.error('Error polling task status:', error)
          send(JSON.stringify({ type: 'error', message: 'Failed to fetch status' }))
        }
      }, 2000)

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
