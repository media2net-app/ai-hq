'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreateTaskFormProps {
  projectId: string
  onSuccess: () => void
}

export default function CreateTaskForm({
  projectId,
  onSuccess,
}: CreateTaskFormProps) {
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          prompt: prompt.trim(),
        }),
      })

      if (response.ok) {
        const task = await response.json()
        setPrompt('')
        onSuccess()
        // Navigate to task page
        router.push(`/tasks/${task.id}`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Wat wil je dat ik doe?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Bijvoorbeeld: Voeg een login pagina toe met email en password authenticatie"
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          rows={6}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !prompt.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Aanmaken...' : 'Task Starten'}
      </button>
    </form>
  )
}
