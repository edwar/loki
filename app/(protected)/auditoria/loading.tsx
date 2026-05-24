import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-56" />
          </div>
          <Skeleton className="h-5 w-80" />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-36" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-accent/5">
                {['Fecha y Hora', 'Usuario', 'Acción', 'Entidad', 'Detalles', 'IP'].map((_, i) => (
                  <th key={i} className="h-14 px-3 sm:px-6">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, r) => (
                <tr key={r} className="border-b border-border/30">
                  <td className="px-3 sm:px-6 py-4 space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
