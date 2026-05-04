import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Building2 } from 'lucide-react'
import { DeleteButton } from './delete-button'
import { ModalWrapper } from './modal-wrapper'
import { NewPropertySection } from '@/components/new-property-section'

export const dynamic = 'force-dynamic'

const PROPERTY_TYPES = [
  { value: 'terreno', label: 'Terreno' },
  { value: 'edificio', label: 'Edificio' },
  { value: 'vehiculo', label: 'Vehículo' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'mueble', label: 'Mueble' },
  { value: 'maquinaria', label: 'Maquinaria' },
  { value: 'otro', label: 'Otro' },
]

async function getProperties() {
  const properties = await prisma.property.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' }
  })

  // Serialize properties to avoid "Decimal objects are not supported" error
  return properties.map(p => ({
    ...p,
    purchaseValue: Number(p.purchaseValue),
    currentValue: Number(p.currentValue),
    purchaseDate: p.purchaseDate?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))
}

export default async function BienesPage() {
  const properties = await getProperties()

  const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0)
  const propertyCount = properties.length

  const typeLabel = (type: string) => PROPERTY_TYPES.find(t => t.value === type)?.label || type

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-display">Bienes y Activos</h1>
        <p className="text-muted-foreground font-medium mt-1">Gestiona los activos de tu empresa y su valoración.</p>
      </div>
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Total Bienes</p>
                <p className="text-3xl font-extrabold">{propertyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-2xl text-white">$</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Valor Total</p>
                <p className="text-3xl font-extrabold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Property Section */}
      <NewPropertySection />

      {/* Properties Table */}
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
        <CardHeader className="px-8 py-6 mb-0 flex flex-row items-center justify-between border-b border-border/30 bg-primary/5">
          <CardTitle className="text-xl">Lista de Bienes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Building2 className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">No hay bienes registrados</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-accent/5">
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-8 py-4">Nombre</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Tipo</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Dirección</th>
                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Valor Compra</th>
                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Valor Actual</th>
                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-8 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property: any) => (
                  <tr key={property.id} className="border-b border-border/10 hover:bg-accent/30 transition-colors group">
                    <td className="px-8 py-4">
                      <p className="font-bold text-lg text-foreground">{property.name}</p>
                      {property.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{property.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 bg-accent/50 text-muted-foreground rounded-lg text-xs font-bold uppercase tracking-tighter">
                        {typeLabel(property.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{property.address || '-'}</td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground">{formatCurrency(Number(property.purchaseValue))}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(Number(property.currentValue))}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <ModalWrapper property={property} />
                        <DeleteButton id={property.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}