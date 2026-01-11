'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CreateTaskForm from '@/components/CreateTaskForm'
import TaskList from '@/components/TaskList'

interface Project {
  id: string
  name: string
  description?: string | null
  githubRepo?: string | null
  _count?: { tasks: number }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()

  const projectId = useMemo(() => {
    const id = params?.id
    return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : ''
  }, [params])

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Primary: database-backed detail endpoint
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
        return
      }

      // Fallback: GitHub list endpoint (no DB / Prisma not available)
      const listResponse = await fetch('/api/projects')
      if (listResponse.ok) {
        const list = await listResponse.json()
        const found =
          Array.isArray(list) ? list.find((p) => String(p?.id) === projectId) : null
        if (found) {
          setProject(found)
          return
        }
      }

      setError('Project niet gevonden')
    } catch (e) {
      console.error('Error fetching project:', e)
      setError('Fout bij ophalen van project')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    fetchProject()
  }, [fetchProject, projectId])

  if (isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <p>Laden...</p>
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => router.push('/')} className="mb-6 text-blue-600 hover:underline">
            ← Terug
          </button>
          <p>{error || 'Project niet gevonden'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push('/')}
              className="mb-4 text-blue-600 hover:underline"
            >
              ← Terug naar projecten
            </button>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="golden-button">Test</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Nieuwe task</h2>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <CreateTaskForm projectId={project.id} onSuccess={fetchProject} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            <TaskList projectId={project.id} />
          </div>
        </div>
      </div>
    </main>
  )
}