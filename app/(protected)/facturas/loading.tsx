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
          <Skeleton className="h-12 px-6 rounded-lg w-36" />
          <Skeleton className="h-12 px-6 rounded-lg w-40" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 min-w-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative p-8 space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-4 flex items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
        <div className="px-8 py-6 border-b border-border/30 bg-primary/5">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-accent/5">
                {['Folio', 'Fecha', 'Cliente', 'Total', 'Estado', 'Pago', 'Acciones'].map((_, i) => (
                  <th key={i} className="h-14 px-3 sm:px-6">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, r) => (
                <tr key={r} className="border-b border-border/30">
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-3 sm:px-6 py-4 space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-28" />
                  </td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-5 w-24 rounded-lg" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-5 w-24 rounded-lg" /></td>
                  <td className="px-3 sm:px-6 py-4"><Skeleton className="h-8 w-16 rounded ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
