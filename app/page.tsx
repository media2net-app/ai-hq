'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'
import CreateProjectModal from '@/components/CreateProjectModal'

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
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI-HQ Dashboard</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Beheer je projecten en automatiseer workflows met AI agents
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Nieuw Project
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Laden...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 mb-4">Nog geen projecten</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Maak je eerste project aan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </main>
  )
}
