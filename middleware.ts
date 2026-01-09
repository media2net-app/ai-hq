// Temporarily disable auth middleware for development
// Uncomment when GitHub OAuth is configured
/*
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
})
*/

export default function middleware() {
  // No-op for now
}

export const config = {
  matcher: [
    // Temporarily disabled - uncomment when auth is configured
    // '/api/projects/:path*',
    // '/api/tasks/:path*',
    // '/projects/:path*',
    // '/tasks/:path*',
  ],
}
