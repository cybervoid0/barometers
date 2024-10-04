// import authMiddleware from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  // Получаем JWT токен
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  console.log('Token:', token)
  console.log('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET)
  console.log('NEXTAUTH_URL', process.env.NEXTAUTH_URL)

  // Если токена нет, перенаправляем на страницу логина
  if (!token) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // Если токен есть, продолжаем с запросом
  return NextResponse.next()
}

// sets up protected routes
//export default authMiddleware

export const config = { matcher: ['/admin', '/admin/'] }
