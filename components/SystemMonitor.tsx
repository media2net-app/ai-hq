'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import CPUMonitor from './CPUMonitor'
import MemoryMonitor from './MemoryMonitor'
import PerformanceChart from './PerformanceChart'
import MemoryHelper from './MemoryHelper'

interface SystemStats {
  cpu: {
    manufacturer: string
    brand: string
    cores: number
    physicalCores: number
    usage: string
    loadAverage: number
  }
  memory: {
    total: number
    used: number
    free: number
    active: number
    available: number
    usage: string
  }
  timestamp: string
}

interface ChartDataPoint {
  time: string
  cpu: number
  memory: number
  timestamp: number
}

export default function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const maxDataPoints = 60

  useEffect(() => {
    // Initial fetch
    fetch('/api/system/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(data)
          addDataPoint(data)
        }
      })
      .catch(console.error)

    // Setup SSE voor real-time updates
    const eventSource = new EventSource('/api/system/stats/stream')

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'update') {
        const newStats = {
          cpu: data.cpu,
          memory: data.memory,
          timestamp: data.timestamp,
        }
        setStats(newStats)
        addDataPoint(newStats)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const addDataPoint = (statsData: SystemStats) => {
    const now = new Date()
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

    const newPoint: ChartDataPoint = {
      time: timeLabel,
      cpu: parseFloat(statsData.cpu.usage),
      memory: parseFloat(statsData.memory.usage),
      timestamp: now.getTime(),
    }

    setChartData((prev) => {
      const updated = [...prev, newPoint]
      return updated.slice(-maxDataPoints)
    })
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 h-64"
          >
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Laden...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const memUsage = stats ? parseFloat(stats.memory.usage) : 0

  return (
    <div className="space-y-4">
      {/* Memory Warning */}
      <MemoryHelper memUsage={memUsage} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Systeem Monitor</h2>
            <p className="text-xs text-gray-400">Real-time performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full ${
                isConnected ? 'bg-emerald-500/20 animate-pulse' : 'bg-red-500/20'
              }`}
            />
            <div
              className={`relative w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </div>
          <span className="text-xs font-medium text-gray-300">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CPUMonitor stats={stats} isConnected={isConnected} />
        <MemoryMonitor stats={stats} isConnected={isConnected} />
        <PerformanceChart chartData={chartData} maxDataPoints={maxDataPoints} />
      </div>
    </div>
  )
}
