#!/usr/bin/env node

/**
 * Background Worker Process
 * Run this separately to process tasks from the queue
 */

import '../lib/queue'

console.log('🚀 AI-HQ Worker started')
console.log('Listening for tasks...')

// Keep process alive
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  const { closeQueue } = await import('../lib/queue')
  await closeQueue()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  const { closeQueue } = await import('../lib/queue')
  await closeQueue()
  process.exit(0)
})
