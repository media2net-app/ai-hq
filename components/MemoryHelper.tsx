'use client'

import { useState } from 'react'
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'

interface MemoryHelperProps {
  memUsage: number
}

export default function MemoryHelper({ memUsage }: MemoryHelperProps) {
  const [showTips, setShowTips] = useState(false)

  if (memUsage < 80) return null

  return (
    <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-400 mb-1">
              Hoog Geheugengebruik ({memUsage.toFixed(1)}%)
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Je geheugengebruik is kritiek hoog. Dit kan de prestaties beïnvloeden.
            </p>
            {showTips && (
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Sluit ongebruikte applicaties (Command+Q)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Herstart je browser - sluit onnodige tabs</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Run: <code className="bg-gray-800 px-1 rounded">node scripts/kill-node-processes.js</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Clear cache: <code className="bg-gray-800 px-1 rounded">sudo purge</code> (vereist admin)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Herstart je Mac voor volledige cleanup</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowTips(!showTips)}
          className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-red-500/30 text-xs text-gray-300 transition-colors"
        >
          {showTips ? 'Verberg' : 'Tips'}
        </button>
      </div>
    </div>
  )
}
