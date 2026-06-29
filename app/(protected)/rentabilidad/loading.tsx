import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-12 w-44 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg border border-border/50" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border/30">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32 rounded-lg" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-accent/5">
                    {['Producto', 'Precio Venta', 'Costo', 'Margen', '% Margen'].map((_, i) => (
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
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-20" />
                      </td>
                      <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                      <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                      <td className="px-3 sm:px-6 py-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                      <td className="px-3 sm:px-6 py-4"><Skeleton className="h-5 w-16 rounded-full ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm p-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
