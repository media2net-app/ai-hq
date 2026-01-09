import { prisma } from '@/lib/prisma'
import { cloneOrUpdateRepo, readRepoFile, writeRepoFile, commitChanges, pushChanges, listRepoFiles } from '@/lib/git'
import OpenAI from 'openai'
import { triggerDeployment } from '@/lib/vercel'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Action {
  type: 'read' | 'write' | 'create' | 'modify'
  file: string
  content?: string
  description: string
}

interface ExecutionPlan {
  actions: Action[]
  summary: string
}

// Analyze prompt and generate execution plan
async function analyzePrompt(
  prompt: string,
  repoPath: string
): Promise<ExecutionPlan> {
  // Get project structure
  const files = await listRepoFiles(repoPath)
  const projectStructure = files.slice(0, 50).join('\n') // Limit to first 50 files

  const systemPrompt = `You are an AI coding assistant. Analyze the user's prompt and create a detailed execution plan.

Project structure:
${projectStructure}

Create a plan with specific actions (read, write, create, modify files).
Return a JSON object with:
{
  "actions": [
    {
      "type": "read" | "write" | "create" | "modify",
      "file": "path/to/file",
      "content": "file content (for write/create/modify)",
      "description": "what this action does"
    }
  ],
  "summary": "brief summary of what will be done"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(response) as ExecutionPlan
  } catch (error: any) {
    throw new Error(`Failed to analyze prompt: ${error.message}`)
  }
}

// Execute a single action
async function executeAction(
  action: Action,
  repoPath: string,
  taskId: string
): Promise<void> {
  // Log action
  await prisma.taskLog.create({
    data: {
      taskId,
      message: `${action.type}: ${action.file} - ${action.description}`,
      type: 'INFO',
    },
  })

  switch (action.type) {
    case 'read':
      await readRepoFile(repoPath, action.file)
      break

    case 'write':
    case 'create':
      if (!action.content) {
        throw new Error(`Content required for ${action.type} action`)
      }
      await writeRepoFile(repoPath, action.file, action.content)
      await prisma.taskLog.create({
        data: {
          taskId,
          message: `Created/updated: ${action.file}`,
          type: 'SUCCESS',
        },
      })
      break

    case 'modify':
      if (!action.content) {
        throw new Error('Content required for modify action')
      }
      const existingContent = await readRepoFile(repoPath, action.file)
      // Simple merge - in production, use proper diff/merge
      await writeRepoFile(repoPath, action.file, action.content)
      await prisma.taskLog.create({
        data: {
          taskId,
          message: `Modified: ${action.file}`,
          type: 'SUCCESS',
        },
      })
      break
  }
}

// Main task execution function
export async function executeTask(taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  })

  if (!task) {
    throw new Error(`Task ${taskId} not found`)
  }

  if (!task.project.githubRepo) {
    throw new Error('Project must have a GitHub repository')
  }

  // Update task status
  await prisma.task.update({
    where: { id: taskId },
    data: { status: 'IN_PROGRESS' },
  })

  await prisma.taskLog.create({
    data: {
      taskId,
      message: `Starting execution: ${task.prompt}`,
      type: 'INFO',
    },
  })

  const [owner, repo] = task.project.githubRepo.split('/')
  let repoPath: string | null = null

  try {
    // 1. Clone/update repository
    await prisma.taskLog.create({
      data: {
        taskId,
        message: `Cloning repository: ${task.project.githubRepo}`,
        type: 'INFO',
      },
    })

    repoPath = await cloneOrUpdateRepo(owner, repo)

    await prisma.taskLog.create({
      data: {
        taskId,
        message: 'Repository cloned successfully',
        type: 'SUCCESS',
      },
    })

    // 2. Analyze prompt and generate plan
    await prisma.taskLog.create({
      data: {
        taskId,
        message: 'Analyzing prompt and generating execution plan...',
        type: 'INFO',
      },
    })

    const plan = await analyzePrompt(task.prompt, repoPath)

    await prisma.taskLog.create({
      data: {
        taskId,
        message: `Plan generated: ${plan.summary}`,
        type: 'INFO',
      },
    })

    // 3. Execute actions
    for (const action of plan.actions) {
      await executeAction(action, repoPath, taskId)
    }

    // 4. Commit changes
    await prisma.taskLog.create({
      data: {
        taskId,
        message: 'Committing changes...',
        type: 'INFO',
      },
    })

    await commitChanges(repoPath, `AI: ${task.prompt}`)

    await prisma.taskLog.create({
      data: {
        taskId,
        message: 'Changes committed successfully',
        type: 'SUCCESS',
      },
    })

    // 5. Push changes
    await prisma.taskLog.create({
      data: {
        taskId,
        message: 'Pushing changes to GitHub...',
        type: 'INFO',
      },
    })

    await pushChanges(repoPath)

    await prisma.taskLog.create({
      data: {
        taskId,
        message: 'Changes pushed successfully',
        type: 'SUCCESS',
      },
    })

    // 6. Trigger Vercel deployment (if configured)
    if (task.project.vercelProjectId) {
      await prisma.taskLog.create({
        data: {
          taskId,
          message: 'Triggering Vercel deployment...',
          type: 'INFO',
        },
      })

      try {
        const deployment = await triggerDeployment(task.project.vercelProjectId)
        await prisma.taskLog.create({
          data: {
            taskId,
            message: `Deployment triggered: ${deployment.url}`,
            type: 'SUCCESS',
          },
        })
      } catch (error: any) {
        await prisma.taskLog.create({
          data: {
            taskId,
            message: `Deployment failed: ${error.message}`,
            type: 'WARNING',
          },
        })
      }
    }

    // 7. Mark task as completed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        result: JSON.stringify({ summary: plan.summary, actions: plan.actions.length }),
      },
    })

    await prisma.taskLog.create({
      data: {
        taskId,
        message: 'Task completed successfully!',
        type: 'SUCCESS',
      },
    })
  } catch (error: any) {
    // Mark task as failed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    })

    await prisma.taskLog.create({
      data: {
        taskId,
        message: `Task failed: ${error.message}`,
        type: 'ERROR',
      },
    })

    throw error
  }
}
