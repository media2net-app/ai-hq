'use client'

import Link from 'next/link'
import { Folder, GitBranch, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: CheckCircle2,
        }
      case 'IN_PROGRESS':
        return {
          bg: 'bg-teal-500/20',
          border: 'border-teal-500/30',
          text: 'text-teal-400',
          icon: Clock,
        }
      case 'FAILED':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: XCircle,
        }
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          icon: AlertCircle,
        }
    }
  }

  const statusConfig = latestTask ? getStatusConfig(latestTask.status) : null
  const StatusIcon = statusConfig?.icon || AlertCircle

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-4 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer h-full">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Folder className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-1 truncate group-hover:text-emerald-400 transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            {latestTask && statusConfig && (
              <div className={`px-2 py-1 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex items-center gap-1.5 flex-shrink-0`}>
                <StatusIcon className={`w-3 h-3 ${statusConfig.text}`} />
                <span className={`text-xs font-medium ${statusConfig.text} uppercase tracking-wider hidden sm:inline`}>
                  {latestTask.status}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            {project.githubRepo && (
              <div className="flex items-center gap-1.5 min-w-0">
                <GitBranch className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{project.githubRepo.split('/')[1]}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{taskCount} tasks</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
