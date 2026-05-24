import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-12 w-40 rounded-lg" />
      </div>

      <div className="grid gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
            <CardHeader className="px-4 md:px-5 py-4 flex flex-row items-start md:items-center justify-between gap-2 cursor-pointer">
              <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
                <Skeleton className="w-10 h-10 shrink-0 rounded-lg" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center gap-3 sm:ml-2 sm:pl-3 sm:border-l border-border/30">
                      <div className="space-y-0.5">
                        <Skeleton className="h-2 w-16" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <div className="space-y-0.5 ml-3">
                        <Skeleton className="h-2 w-16" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex gap-1 mr-1 pr-2 border-r border-border/30">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
