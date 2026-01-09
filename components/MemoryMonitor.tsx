'use client'

import { MemoryStick, Activity, Zap, TrendingUp } from 'lucide-react'

interface SystemStats {
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

interface MemoryMonitorProps {
  stats: SystemStats
  isConnected: boolean
}

export default function MemoryMonitor({ stats, isConnected }: MemoryMonitorProps) {
  const memUsage = parseFloat(stats.memory.usage)

  const getMemGradient = () => {
    if (memUsage > 80) return 'from-red-500 via-orange-500 to-red-600'
    if (memUsage > 50) return 'from-yellow-500 via-amber-500 to-yellow-600'
    return 'from-emerald-500 via-teal-500 to-cyan-500'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:border-teal-500/30 transition-all duration-300 h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
              <MemoryStick className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Geheugen
              </h3>
              <p className="text-xs text-gray-500">RAM Usage</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {stats.memory.usage}%
            </div>
            <div className="text-xs text-gray-500 mt-1">{formatBytes(stats.memory.used)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getMemGradient()} transition-all duration-500 ease-out shadow-lg shadow-teal-500/50`}
              style={{ width: `${memUsage}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Totaal
            </span>
            <span className="font-medium text-gray-300">{formatBytes(stats.memory.total)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Beschikbaar
            </span>
            <span className="font-medium text-gray-300">
              {formatBytes(stats.memory.available)}
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Actief
            </span>
            <span className="font-medium text-gray-300">{formatBytes(stats.memory.active)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
