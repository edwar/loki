import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  
  // Lista de rutas protegidas
  const protectedPaths = [
    '/dashboard',
    '/insumos',
    '/productos',
    '/ventas',
    '/gastos',
    '/proveedores',
    '/clientes'
  ]
  
  const isProtectedPage = protectedPaths.some(path => pathname.startsWith(path))

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  if (isProtectedPage) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
    '/insumos/:path*',
    '/productos/:path*',
    '/ventas/:path*',
    '/gastos/:path*',
    '/proveedores/:path*',
    '/clientes/:path*',
  ],
}