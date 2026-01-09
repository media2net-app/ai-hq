#!/usr/bin/env tsx

/**
 * Script om een user toe te voegen aan de database
 */

import { prisma } from '../lib/prisma'

async function createUser() {
  try {
    const userId = '46466c3f-a639-4925-a74b-d397772639d9'
    const email = 'chiel@media2net.nl'
    const name = 'Chiel'

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (existing) {
      console.log('✅ User bestaat al:', existing.email)
      return
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        emailVerified: new Date(),
      },
    })

    console.log('✅ User aangemaakt:')
    console.log('  ID:', user.id)
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
