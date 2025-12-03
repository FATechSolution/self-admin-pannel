import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login'
  
  // Get token from cookies (you can change this based on your auth setup)
  const token = request.cookies.get('token')?.value || ''
  
  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token && path !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to dashboard if accessing login with token
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
