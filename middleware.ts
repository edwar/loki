import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/insumos/:path*',
    '/productos/:path*',
    '/ventas/:path*',
    '/gastos/:path*',
    '/proveedores/:path*',
    '/clientes/:path*',
  ],
}