#!/usr/bin/env node

/**
 * Kill oude Node.js processen die veel geheugen gebruiken
 */

const { execSync } = require('child_process')

try {
  // Haal alle Node processen op
  const processes = execSync('ps aux | grep node | grep -v grep', { encoding: 'utf-8' })
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const parts = line.trim().split(/\s+/)
      return {
        pid: parts[1],
        mem: parseFloat(parts[3]),
        command: parts.slice(10).join(' ')
      }
    })
    .filter(p => p.pid && !p.command.includes('kill-node-processes'))

  if (processes.length === 0) {
    console.log('✅ Geen Node processen gevonden om te killen')
    process.exit(0)
  }

  console.log(`🔍 Gevonden ${processes.length} Node processen:\n`)
  processes.forEach((p, i) => {
    console.log(`   ${i + 1}. PID ${p.pid.padStart(6)} - ${p.mem.toFixed(1)}% MEM - ${p.command.substring(0, 60)}`)
  })

  // Kill processen die meer dan 5% geheugen gebruiken of oude dev servers
  const toKill = processes.filter(p => 
    p.mem > 5 || 
    p.command.includes('next dev') ||
    p.command.includes('vite') ||
    p.command.includes('webpack')
  )

  if (toKill.length === 0) {
    console.log('\n✅ Geen processen gevonden die gekilled moeten worden')
    process.exit(0)
  }

  console.log(`\n⚠️  Gaat ${toKill.length} processen killen...\n`)
  
  toKill.forEach(p => {
    try {
      execSync(`kill ${p.pid}`, { stdio: 'ignore' })
      console.log(`   ✅ Killed PID ${p.pid} (${p.mem.toFixed(1)}% MEM)`)
    } catch (error) {
      console.log(`   ❌ Kon PID ${p.pid} niet killen: ${error.message}`)
    }
  })

  console.log('\n✅ Cleanup voltooid!')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
