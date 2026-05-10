'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ReactNode } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  actionLabel?: ReactNode
  onAction?: () => void
  compact?: boolean
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, compact, className }: EmptyStateProps) {
  if (compact) {
    return (
      <div className={cn("h-full flex flex-col items-center justify-center text-center space-y-2", className)}>
        <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center mx-auto">
          <Icon size={20} className="text-muted-foreground/30" />
        </div>
        <p className="text-md font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1 mx-auto"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="rounded-lg border-dashed border-2 py-16 bg-accent/5">
      <CardContent className="text-center space-y-4">
        <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center mx-auto">
          <Icon size={32} className="text-muted-foreground/30" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-lg">{title}</p>
          <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
            {description}
          </p>
        </div>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors mx-auto"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}