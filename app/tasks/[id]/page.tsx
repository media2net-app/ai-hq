'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface TaskLog {
  id: string
  message: string
  type: string
  timestamp: string
}

interface Task {
  id: string
  prompt: string
  status: string
  result?: string | null
  error?: string | null
  createdAt: string
  completedAt?: string | null
  project: {
    id: string
    name: string
  }
  logs: TaskLog[]
}

export default function TaskPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTask()
      setupSSE()
    }
  }, [params.id])

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data)
      }
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupSSE = () => {
    const eventSource = new EventSource(`/api/tasks/${params.id}/status`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'update') {
        setTask((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            status: data.status,
            result: data.result,
            error: data.error,
            logs: data.logs || prev.logs,
          }
        })
      }

      if (data.type === 'complete' || data.type === 'error') {
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 dark:text-green-400'
      case 'ERROR':
        return 'text-red-600 dark:text-red-400'
      case 'WARNING':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <p>Laden...</p>
        </div>
      </main>
    )
  }

  if (!task) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <p>Task niet gevonden</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push(`/projects/${task.project.id}`)}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Terug naar {task.project.name}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">Task Details</h1>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            {task.prompt}
          </p>
          <div className="text-sm text-gray-500">
            Aangemaakt: {new Date(task.createdAt).toLocaleString('nl-NL')}
            {task.completedAt &&
              ` • Voltooid: ${new Date(task.completedAt).toLocaleString('nl-NL')}`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Logs</h2>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto">
              {task.logs.length === 0 ? (
                <p className="text-gray-500">Nog geen logs</p>
              ) : (
                <div className="space-y-2 font-mono text-sm">
                  {task.logs.map((log) => (
                    <div key={log.id} className={getLogColor(log.type)}>
                      <span className="text-gray-500">
                        [{new Date(log.timestamp).toLocaleTimeString('nl-NL')}]
                      </span>{' '}
                      {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Resultaat</h2>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              {task.error ? (
                <div className="text-red-600 dark:text-red-400">
                  <strong>Error:</strong> {task.error}
                </div>
              ) : task.result ? (
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {task.result}
                </div>
              ) : (
                <p className="text-gray-500">Nog geen resultaat</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
