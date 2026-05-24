import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-12 w-40 rounded-lg" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-accent/5">
                    {['Usuario', 'Rol', 'Registro', 'Acción'].map((_, i) => (
                      <th key={i} className="h-14 px-3 sm:px-6">
                        <Skeleton className="h-3 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, r) => (
                    <tr key={r} className="border-b border-border/30">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4"><Skeleton className="h-8 w-28 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-3 sm:px-6 py-4"><Skeleton className="h-8 w-20 rounded ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
