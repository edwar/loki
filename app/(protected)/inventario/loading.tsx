import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm p-6 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border/30">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-accent/5">
                {['Nombre', 'Categoría', 'Stock', 'Precio', 'Valor Total', 'Acciones'].map((_, i) => (
                  <th key={i} className="h-14 px-3 sm:px-6">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, r) => (
                <tr key={r} className="border-b border-border/30">
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-8 py-4 border-t border-border/30">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
