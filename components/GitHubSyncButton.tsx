'use client'

import { useState } from 'react'
import { Github, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface GitHubSyncButtonProps {
  onSyncComplete: () => void
}

export default function GitHubSyncButton({ onSyncComplete }: GitHubSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    details?: any
  }>({ type: null, message: '' })

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org: 'media2net-app' }),
      })

      const data = await response.json()

      if (response.ok) {
        setSyncStatus({
          type: 'success',
          message: `Successvol gesynchroniseerd: ${data.synced} projecten`,
          details: data.details,
        })
        onSyncComplete()
      } else {
        setSyncStatus({
          type: 'error',
          message: data.message || 'Fout bij synchroniseren',
        })
      }
    } catch (error: any) {
      setSyncStatus({
        type: 'error',
        message: error.message || 'Fout bij verbinden met GitHub',
      })
    } finally {
      setIsSyncing(false)
      // Clear status after 5 seconds
      setTimeout(() => {
        setSyncStatus({ type: null, message: '' })
      }, 5000)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {syncStatus.type && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            syncStatus.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {syncStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{syncStatus.message}</span>
          {syncStatus.details && (
            <span className="text-xs opacity-75">
              ({syncStatus.details.created} nieuw, {syncStatus.details.updated} bijgewerkt)
            </span>
          )}
        </div>
      )}
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Github className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Synchroniseren...
          </>
        ) : (
          'Sync met GitHub'
        )}
      </button>
    </div>
  )
}
