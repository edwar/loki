import { getSuppliers } from '@/lib/actions/suppliers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Building2, Truck, Handshake } from 'lucide-react'
import { SupplierForm } from '@/components/supplier-forms'
import { SupplierTable } from '@/components/supplier-table'

export const dynamic = 'force-dynamic'

export default async function ProveedoresPage() {
  const suppliers = await getSuppliers()

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-display">Red de Proveedores</h1>
        <p className="text-muted-foreground font-medium mt-1">Gestiona tus fuentes de abastecimiento y relaciones comerciales.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-none bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Proveedores Registrados</p>
                <p className="text-3xl font-extrabold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-gradient-to-br from-amber-500/10 to-amber-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Aliados Comerciales</p>
                <p className="text-3xl font-extrabold">{suppliers.filter(s => s._count.purchases > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Supplier Form */}
      <Card className="rounded-lg border-primary/20 bg-primary/[0.02]">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Plus size={20} className="text-white" />
            </div>
            <CardTitle>Vincular Nuevo Proveedor</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <SupplierForm />
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Lista de Proveedores</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <SupplierTable suppliers={suppliers} />
        </CardContent>
      </Card>
    </div>
  )
}