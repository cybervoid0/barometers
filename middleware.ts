import authMiddleware from 'next-auth/middleware'

// sets up protected routes
export default authMiddleware

export const config = { matcher: ['/admin/', '/api/barometers'] }
/* 
const session = await getServerSession(authConfig)
  if (!session) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  const user = await User.findOne({ email: session.user?.email })
  if (user?.role !== AccessRole.ADMIN)
    return NextResponse.json({ message: 'Access denied' }, { status: 403 })
*/
