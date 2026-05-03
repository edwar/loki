import { getCustomers } from '@/lib/actions/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, UserPlus, Target } from 'lucide-react'
import { CustomerForm } from '@/components/customer-forms'
import { CustomerTable } from '@/components/customer-table'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-display">Directorio de Clientes</h1>
        <p className="text-muted-foreground font-medium mt-1">Administra tu base de datos y fideliza a tus compradores.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-none bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Clientes Registrados</p>
                <p className="text-3xl font-extrabold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Clientes Activos</p>
                <p className="text-3xl font-extrabold">{customers.filter(c => c._count.sales > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Customer Form */}
      <Card className="rounded-lg border-primary/20 bg-primary/[0.02]">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <UserPlus size={20} className="text-white" />
            </div>
            <CardTitle>Registrar Nuevo Cliente</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <CustomerForm />
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Base de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <CustomerTable customers={customers} />
        </CardContent>
      </Card>
    </div>
  )
}