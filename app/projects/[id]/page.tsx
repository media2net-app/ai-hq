'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TaskList from '@/components/TaskList'
import CreateTaskForm from '@/components/CreateTaskForm'

interface Project {
  id: string
  name: string
  description?: string | null
  githubRepo?: string | null
  vercelProjectId?: string | null
  tasks: Array<{
    id: string
    prompt: string
    status: string
    createdAt: string
  }>
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setIsLoading(false)
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

  if (!project) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <p>Project niet gevonden</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Terug naar dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {project.description}
            </p>
          )}
          <div className="flex gap-4 text-sm text-gray-500">
            {project.githubRepo && (
              <span>📦 GitHub: {project.githubRepo}</span>
            )}
            {project.vercelProjectId && (
              <span>🚀 Vercel: {project.vercelProjectId}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
            <TaskList projectId={project.id} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Nieuwe Task</h2>
            <CreateTaskForm
              projectId={project.id}
              onSuccess={fetchProject}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
