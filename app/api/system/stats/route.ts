import { NextResponse } from 'next/server'

// Check if systeminformation is available (not on Vercel/serverless)
let si: any = null
try {
  si = require('systeminformation')
} catch (e) {
  // systeminformation not available (e.g., on Vercel)
}

export async function GET() {
  // Return mock data on Vercel/serverless environments
  if (!si || process.env.VERCEL) {
    return NextResponse.json({
      cpu: {
        manufacturer: 'Unknown',
        brand: 'Serverless',
        cores: 1,
        physicalCores: 1,
        usage: '0.00',
        loadAverage: 0,
      },
      memory: {
        total: 0,
        used: 0,
        free: 0,
        active: 0,
        available: 0,
        usage: '0.00',
      },
      timestamp: new Date().toISOString(),
    })
  }

  try {
    // Haal systeem statistieken op
    const [cpu, mem, currentLoad] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.currentLoad(),
    ])

    const stats = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        usage: currentLoad.currentLoad.toFixed(2), // Percentage
        loadAverage: currentLoad.avgLoad || 0, // Fallback to 0 if undefined
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        active: mem.active,
        available: mem.available,
        usage: ((mem.used / mem.total) * 100).toFixed(2), // Percentage
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system statistics' },
      { status: 500 }
    )
  }
}
