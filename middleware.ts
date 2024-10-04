import authMiddleware from 'next-auth/middleware'

// sets up protected routes
export default authMiddleware

export const config = { matcher: ['/admin', '/admin/'] }
