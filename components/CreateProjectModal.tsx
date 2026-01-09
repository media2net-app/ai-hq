'use client'

import { useState } from 'react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubRepo: '',
    vercelProjectId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          githubRepo: formData.githubRepo || undefined,
          vercelProjectId: formData.vercelProjectId || undefined,
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
        setFormData({
          name: '',
          description: '',
          githubRepo: '',
          vercelProjectId: '',
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Nieuw Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Project Naam *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Beschrijving
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              GitHub Repo (owner/repo)
            </label>
            <input
              type="text"
              value={formData.githubRepo}
              onChange={(e) =>
                setFormData({ ...formData, githubRepo: e.target.value })
              }
              placeholder="gebruiker/repo"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Vercel Project ID
            </label>
            <input
              type="text"
              value={formData.vercelProjectId}
              onChange={(e) =>
                setFormData({ ...formData, vercelProjectId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Aanmaken...' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
