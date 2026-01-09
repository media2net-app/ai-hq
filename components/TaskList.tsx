'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  prompt: string
  status: string
  createdAt: string
  completedAt?: string | null
}

interface TaskListProps {
  projectId: string
}

export default function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [projectId])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return <p className="text-gray-500">Laden...</p>
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">Nog geen tasks voor dit project</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Link key={task.id} href={`/tasks/${task.id}`}>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <p className="text-gray-800 dark:text-gray-200 flex-1">
                {task.prompt}
              </p>
              <span
                className={`ml-4 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(task.createdAt).toLocaleString('nl-NL')}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
