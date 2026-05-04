import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUsers } from '@/lib/actions/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Mail, Calendar, KeyRound } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { NewUserModal } from '@/components/new-user-modal'
import { UserRoleSelect, DeleteUserButton } from './user-actions'

export const dynamic = 'force-dynamic'

export default async function EquipoPage() {
  const session = await getServerSession(authOptions)

  // Protect route: Only admins can access this page
  if (session?.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const users = await getUsers()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Equipo y Permisos</h1>
          <p className="text-muted-foreground font-medium mt-1">Administra los usuarios y controla quién tiene acceso a cada módulo.</p>
        </div>
        <NewUserModal />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Niveles de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="font-bold text-sm">Administrador</p>
                </div>
                <p className="text-xs text-muted-foreground">Acceso total al sistema, configuración, eliminación de registros y gestión de usuarios.</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <p className="font-bold text-sm">Gerente</p>
                </div>
                <p className="text-xs text-muted-foreground">Acceso a finanzas, compras, ventas e inventario. No puede gestionar usuarios ni bienes.</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="font-bold text-sm">Empleado</p>
                </div>
                <p className="text-xs text-muted-foreground">Acceso limitado solo a Ventas, Producción y Catálogo de Productos.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm h-full">
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-border/10">
              <CardTitle className="text-xl flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Usuarios Activos ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-accent/5 hover:bg-accent/5 border-none">
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold pl-6">Usuario</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Rol</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Registro</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold text-right pr-6 w-16">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-accent/5 transition-colors border-border/10">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/80 to-violet-500/80 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail size={10} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <UserRoleSelect user={user} />
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(user.createdAt).split(',')[0]}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <DeleteUserButton id={user.id} currentUserId={session?.user?.id as string} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
