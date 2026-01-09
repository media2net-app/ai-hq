'use client'

import { useEffect, useState } from 'react'
import ProjectCard from '@/components/ProjectCard'
import SystemMonitor from '@/components/SystemMonitor'

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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Automatisch syncen bij page load
    syncAndFetchProjects()
  }, [])

  const syncAndFetchProjects = async () => {
    setIsSyncing(true)
    try {
      // Haal projecten direct op van GitHub
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || data || [])
        console.log(`Loaded ${data.projects?.length || data?.length || 0} projects from GitHub`)
      } else {
        const errorData = await response.json()
        console.error('Error fetching projects:', errorData)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsSyncing(false)
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              AI-HQ Dashboard
            </h1>
            <p className="text-lg text-gray-400">
              Automatisch gesynchroniseerd met GitHub • {projects.length} projecten
            </p>
          </div>
          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-sm text-emerald-400 font-medium">
                Synchroniseren met GitHub...
              </span>
            </div>
          )}
        </div>

        {/* System Monitor - 3 Cards */}
        <div className="mb-8">
          <SystemMonitor />
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">GitHub Projecten</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Projecten ophalen van GitHub...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
            <p className="text-gray-400 mb-4">Geen projecten gevonden</p>
            <p className="text-sm text-gray-500">
              Controleer of je GitHub token correct is geconfigureerd
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
