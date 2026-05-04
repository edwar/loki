import { getAuditLogs } from '@/lib/actions/audit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { ShieldAlert, User, Activity, Monitor } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { AuditLog } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AuditoriaPage() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const logs = await getAuditLogs()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display flex items-center gap-3">
            <ShieldAlert className="w-10 h-10 text-primary" />
            Logs de Auditoría
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Registro de actividad y sistema anti-fraude.</p>
        </div>
      </div>

      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
        <CardHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between border-b border-border/10">
          <CardTitle className="text-xl">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/5 hover:bg-accent/5 border-none">
                <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold pl-4 sm:pl-6">Fecha y Hora</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Usuario</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Acción</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Entidad</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Detalles</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold text-right pr-4">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                        <Activity size={24} className="text-muted-foreground opacity-30" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No hay registros de auditoría.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: AuditLog) => (
                  <TableRow key={log.id} className="group hover:bg-accent/5 transition-colors border-border/10">
                    <TableCell className="py-4 pl-4 sm:pl-6">
                      <p className="text-xs font-bold text-foreground">{formatDate(log.createdAt).split(',')[0]}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{formatDate(log.createdAt).split(',')[1]}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{log.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-xs font-semibold text-muted-foreground">{log.entity}</span>
                    </TableCell>
                    <TableCell className="py-4 max-w-[200px] truncate">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-2 text-muted-foreground">
                        <Monitor className="w-3 h-3" />
                        <span className="text-[10px] font-mono">{log.ipAddress || 'Desconocida'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
