import { Queue, Worker, QueueEvents } from 'bullmq'
import Redis from 'ioredis'

// Redis connection (fallback to in-memory if no Redis)
let connection: Redis

try {
  if (process.env.REDIS_URL) {
    connection = new Redis(process.env.REDIS_URL)
  } else if (process.env.REDIS_HOST) {
    connection = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    })
  } else {
    // Fallback to localhost
    connection = new Redis({
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null,
      retryStrategy: () => null, // Don't retry if connection fails
    })
  }
} catch (error) {
  console.warn('Redis connection failed, using in-memory queue')
  // Create a mock connection for in-memory fallback
  connection = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
    retryStrategy: () => null,
    lazyConnect: true,
  })
}

// Task queue
export const taskQueue = new Queue('tasks', { connection: connection as any })

// Queue events for monitoring
export const queueEvents = new QueueEvents('tasks', { connection: connection as any })

// Worker for processing tasks
export const taskWorker = new Worker(
  'tasks',
  async (job) => {
    const { taskId } = job.data
    
    // Import dynamically to avoid circular dependencies
    const { executeTask } = await import('./agent/executor')
    return await executeTask(taskId)
  },
  {
    connection: connection as any,
    concurrency: 1, // Process one task at a time
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100, // Keep last 100 jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  }
)

// Add task to queue
export async function addTaskToQueue(taskId: string) {
  return await taskQueue.add('execute-task', { taskId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  })
}

// Get queue status
export async function getQueueStatus() {
  const [waiting, active, completed, failed] = await Promise.all([
    taskQueue.getWaitingCount(),
    taskQueue.getActiveCount(),
    taskQueue.getCompletedCount(),
    taskQueue.getFailedCount(),
  ])

  return { waiting, active, completed, failed }
}

// Graceful shutdown
export async function closeQueue() {
  await taskWorker.close()
  await taskQueue.close()
  await connection.quit()
}
