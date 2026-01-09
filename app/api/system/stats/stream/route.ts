import { NextRequest } from 'next/server'

// Check if systeminformation is available (not on Vercel/serverless)
let si: any = null
try {
  si = require('systeminformation')
} catch (e) {
  // systeminformation not available (e.g., on Vercel)
}

// GET /api/system/stats/stream - SSE endpoint voor real-time systeem stats
export async function GET(request: NextRequest) {
  // Return empty stream on Vercel/serverless
  if (!si || process.env.VERCEL) {
    return new Response('System monitoring not available on serverless', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      // Send initial connection message
      send(JSON.stringify({ type: 'connected' }))

      // Poll voor updates elke 2 seconden
      const interval = setInterval(async () => {
        try {
          const [cpu, mem, currentLoad] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.currentLoad(),
          ])

          const stats = {
            type: 'update',
            cpu: {
              manufacturer: cpu.manufacturer,
              brand: cpu.brand,
              cores: cpu.cores,
              physicalCores: cpu.physicalCores,
              usage: currentLoad.currentLoad.toFixed(2),
              loadAverage: currentLoad.avgLoad || 0, // Fallback to 0 if undefined
            },
            memory: {
              total: mem.total,
              used: mem.used,
              free: mem.free,
              active: mem.active,
              available: mem.available,
              usage: ((mem.used / mem.total) * 100).toFixed(2),
            },
            timestamp: new Date().toISOString(),
          }

          send(JSON.stringify(stats))
        } catch (error) {
          console.error('Error fetching system stats:', error)
          send(JSON.stringify({ type: 'error', message: 'Failed to fetch stats' }))
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
