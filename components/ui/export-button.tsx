'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { sileo as toast } from 'sileo'

interface ExportButtonProps {
  data: any[]
  filename: string
  label?: string
  className?: string
}

export function ExportButton({ data, filename, label = 'Exportar Excel', className, }: ExportButtonProps) {
  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        toast.warning({ title: 'No hay datos para exportar' })
        return
      }

      // Convert array of objects to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `${filename}.xlsx`)

      toast.success({ title: 'Reporte exportado exitosamente' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error({ title: 'Error al exportar el reporte' })
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className={className || "rounded-lg font-bold"}
    >
      <Download size={16} className="mr-2" />
      {label}
    </Button>
  )
}
