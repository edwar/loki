import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Building2, Plus, X } from 'lucide-react'
import { DeleteButton } from './delete-button'
import { ModalWrapper } from './modal-wrapper'

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
  return properties
}

export default async function BienesPage() {
  const properties = await getProperties()
  
  const totalValue = properties.reduce((sum, p) => sum + Number(p.currentValue), 0)
  const propertyCount = properties.length

  const typeLabel = (type: string) => PROPERTY_TYPES.find(t => t.value === type)?.label || type

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Bienes</h1>
        <p className="text-gray-500 dark:text-slate-400">Gestiona los activos de tu empresa</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase">Total Bienes</p>
                <p className="text-3xl font-bold text-black dark:text-white mt-1">{propertyCount}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-500 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase">Valor Total</p>
                <p className="text-3xl font-bold text-black dark:text-white mt-1">{formatCurrency(totalValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <span className="text-2xl">$</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-6">
          <CardContent className="p-0 flex items-center justify-center h-full">
            <ModalWrapper />
          </CardContent>
        </Card>
      </div>

      {/* Properties Table */}
      <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold text-black dark:text-white">Lista de Bienes</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-400 dark:text-slate-500">No hay bienes registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase py-3">Nombre</th>
                    <th className="text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase py-3">Tipo</th>
                    <th className="text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase py-3">Dirección</th>
                    <th className="text-right text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase py-3">Valor Compra</th>
                    <th className="text-right text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase py-3">Valor Actual</th>
                    <th className="text-center text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="py-4">
                        <p className="font-medium text-black dark:text-white">{property.name}</p>
                        {property.description && (
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{property.description}</p>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                          {typeLabel(property.type)}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-slate-300">{property.address || '-'}</td>
                      <td className="py-4 text-right text-gray-600 dark:text-slate-300">{formatCurrency(Number(property.purchaseValue))}</td>
                      <td className="py-4 text-right font-medium text-black dark:text-white">{formatCurrency(Number(property.currentValue))}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-center">
                          <DeleteButton id={property.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}