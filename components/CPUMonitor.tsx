'use client'

import { Cpu, Zap, TrendingUp } from 'lucide-react'

interface SystemStats {
  cpu: {
    manufacturer: string
    brand: string
    cores: number
    physicalCores: number
    usage: string
    loadAverage: number
  }
  timestamp: string
}

interface CPUMonitorProps {
  stats: SystemStats
  isConnected: boolean
}

export default function CPUMonitor({ stats, isConnected }: CPUMonitorProps) {
  const cpuUsage = parseFloat(stats.cpu.usage)

  const getCpuGradient = () => {
    if (cpuUsage > 80) return 'from-red-500 via-orange-500 to-red-600'
    if (cpuUsage > 50) return 'from-yellow-500 via-amber-500 to-yellow-600'
    return 'from-emerald-500 via-teal-500 to-cyan-500'
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:border-emerald-500/30 transition-all duration-300 h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">CPU</h3>
              <p className="text-xs text-gray-500">{stats.cpu.brand}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {stats.cpu.usage}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.cpu.physicalCores}/{stats.cpu.cores} cores
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getCpuGradient()} transition-all duration-500 ease-out shadow-lg shadow-emerald-500/50`}
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Processor
            </span>
            <span className="font-medium text-gray-300">{stats.cpu.manufacturer}</span>
          </div>
          {stats.cpu.loadAverage !== undefined &&
            stats.cpu.loadAverage !== null &&
            typeof stats.cpu.loadAverage === 'number' &&
            stats.cpu.loadAverage > 0 && (
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                  Load Average
                </span>
                <span className="font-medium text-gray-300">
                  {stats.cpu.loadAverage.toFixed(2)}
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
