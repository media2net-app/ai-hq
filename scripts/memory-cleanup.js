#!/usr/bin/env node

/**
 * Memory Cleanup Script
 * Helpt bij het identificeren en opruimen van geheugengebruik
 */

const si = require('systeminformation')

async function analyzeMemory() {
  console.log('🔍 Geheugen Analyse...\n')

  const mem = await si.mem()
  const processes = await si.processes()

  const totalGB = (mem.total / 1024 / 1024 / 1024).toFixed(2)
  const usedGB = (mem.used / 1024 / 1024 / 1024).toFixed(2)
  const availableGB = (mem.available / 1024 / 1024 / 1024).toFixed(2)
  const usagePercent = ((mem.used / mem.total) * 100).toFixed(2)

  console.log('📊 Huidige Status:')
  console.log(`   Totaal: ${totalGB} GB`)
  console.log(`   Gebruikt: ${usedGB} GB (${usagePercent}%)`)
  console.log(`   Beschikbaar: ${availableGB} GB`)
  console.log(`   Actief: ${(mem.active / 1024 / 1024 / 1024).toFixed(2)} GB\n`)

  // Top 10 processen die het meeste geheugen gebruiken
  const topProcesses = processes.list
    .sort((a, b) => b.mem - a.mem)
    .slice(0, 10)

  console.log('🔥 Top 10 Processen (geheugengebruik):')
  topProcesses.forEach((proc, index) => {
    const memMB = (proc.mem * mem.total / 100).toFixed(0)
    console.log(
      `   ${index + 1}. ${proc.name.padEnd(30)} ${proc.mem.toFixed(2).padStart(6)}% (${memMB} MB)`
    )
  })

  console.log('\n💡 Aanbevelingen:')
  
  if (parseFloat(usagePercent) > 90) {
    console.log('   ⚠️  Geheugengebruik is kritiek hoog!')
    console.log('   • Sluit ongebruikte applicaties')
    console.log('   • Herstart je browser (Chrome/Safari gebruiken veel geheugen)')
    console.log('   • Sluit onnodige tabs')
    console.log('   • Check Activity Monitor voor memory leaks')
  }

  // Check voor Node.js processen
  const nodeProcesses = processes.list.filter((p) => 
    p.name.toLowerCase().includes('node') || 
    p.command.toLowerCase().includes('node')
  )
  
  if (nodeProcesses.length > 5) {
    console.log(`   ⚠️  ${nodeProcesses.length} Node.js processen gevonden`)
    console.log('   • Overweeg om oude Node processen te killen')
  }

  // Check voor browser processen
  const browserProcesses = processes.list.filter((p) => 
    ['chrome', 'safari', 'firefox', 'edge'].some(browser => 
      p.name.toLowerCase().includes(browser)
    )
  )
  
  if (browserProcesses.length > 10) {
    console.log(`   ⚠️  ${browserProcesses.length} browser processen gevonden`)
    console.log('   • Sluit onnodige browser tabs')
    console.log('   • Herstart je browser')
  }

  console.log('\n🛠️  Quick Fixes:')
  console.log('   1. Sluit ongebruikte apps: Command+Q')
  console.log('   2. Herstart Finder: killall Finder')
  console.log('   3. Clear system cache: sudo purge (vereist admin)')
  console.log('   4. Herstart je Mac voor volledige cleanup')
}

analyzeMemory().catch(console.error)
