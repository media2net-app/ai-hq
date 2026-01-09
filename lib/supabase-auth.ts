import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma'

const supabaseUrl = process.env.SUPABASE_URL || 'https://kwfyehmszybxvsjyunkk.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_l4lhX5DdhQcgZ0MM9-T2EQ_4ldIdAs8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Verify Supabase auth user and sync with Prisma User
export async function verifySupabaseUser(supabaseUserId: string, email: string) {
  // Check if user exists in Prisma
  let user = await prisma.user.findUnique({
    where: { id: supabaseUserId },
  })

  if (!user) {
    // Create user in Prisma if it doesn't exist
    user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        emailVerified: new Date(),
      },
    })
  }

  return user
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user) {
    // Sync user with Prisma
    const user = await verifySupabaseUser(data.user.id, data.user.email || email)
    return { user, session: data.session }
  }

  throw new Error('Authentication failed')
}
