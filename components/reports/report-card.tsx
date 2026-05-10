'use client'

import { FileText } from 'lucide-react'

interface ReportCardProps {
  type: string
  title: string
  description: string
  icon: any
  color: string
  onClick: () => void
}

export function ReportCard({ type, title, description, icon: Icon, color, onClick }: ReportCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden text-left hover:border-primary/50 hover:bg-card/50 transition-all duration-300 group p-0"
    >
      <div className="p-8 space-y-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </button>
  )
}