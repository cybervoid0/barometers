import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

// Protects admin routes and checks user role
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token

    // User is authenticated but doesn't have admin role
    if (token && token.role !== 'ADMIN' && token.role !== 'OWNER') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access if user is authenticated (role check is in middleware function)
        return !!token
      },
    },
    pages: {
      signIn: '/signin',
    },
  },
)

export const config = { matcher: ['/admin/:path*'] }
