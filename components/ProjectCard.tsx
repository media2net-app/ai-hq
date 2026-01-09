'use client'

import Link from 'next/link'

interface Project {
  id: string
  name: string
  description?: string | null
  githubRepo?: string | null
  _count?: {
    tasks: number
  }
  tasks?: Array<{
    id: string
    status: string
  }>
}

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const latestTask = project.tasks?.[0]
  const taskCount = project._count?.tasks || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{project.name}</h3>
          {latestTask && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                latestTask.status
              )}`}
            >
              {latestTask.status}
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {project.githubRepo && (
            <span>📦 {project.githubRepo}</span>
          )}
          <span>📋 {taskCount} tasks</span>
        </div>
      </div>
    </Link>
  )
}
