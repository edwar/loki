'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { sileo as toast } from 'sileo'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ColumnDef {
  key: string
  label: string
  format?: (value: any, row: any) => string
  width?: number
}

interface ExportButtonProps {
  data: any[]
  filename: string
  label?: string
  className?: string
  columns?: ColumnDef[]
  title?: string
  sheetName?: string
}

export function ExportButton({ 
  data, 
  filename, 
  label = 'Exportar Excel', 
  className,
  columns,
  title,
  sheetName = 'Datos'
}: ExportButtonProps) {
  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        toast.warning({ title: 'No hay datos para exportar' })
        return
      }

      const workbook = XLSX.utils.book_new()
      
      // Transform data with columns if provided
      let processedData = data
      if (columns && columns.length > 0) {
        processedData = data.map(row => {
          const newRow: Record<string, any> = {}
          columns.forEach(col => {
            const value = row[col.key]
            newRow[col.label] = col.format ? col.format(value, row) : value
          })
          return newRow
        })
      }

      const worksheet = XLSX.utils.json_to_sheet(processedData)

      // Set column widths
      if (columns && columns.length > 0) {
        const colWidths: { wch: number }[] = columns.map(col => ({
          wch: col.width || col.label.length + 10
        }))
        worksheet['!cols'] = colWidths
      }

      // Add header row with timestamp
      if (title) {
        const titleRow = [{ A: title }]
        const dateRow = [{ A: `Exportado: ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: es })}` }]
        
        XLSX.utils.sheet_add_json(worksheet, titleRow, { origin: 'A1' })
        XLSX.utils.sheet_add_json(worksheet, dateRow, { origin: 'A2' })
        
        // Move data to start at row 4 to leave space for title and date
        const dataStartRow = 4
        const originalData = XLSX.utils.sheet_to_json(worksheet)
        worksheet['!ref'] = XLSX.utils.encode_range({
          s: { c: 0, r: 0 },
          e: { c: Object.keys(processedData[0] || {}).length - 1, r: originalData.length + 3 }
        })
        
        // Re-add with proper offset
        XLSX.utils.sheet_add_json(worksheet, originalData, { origin: `A${dataStartRow}` })
        
        // Style header row (row 4)
        const headerRowNum = dataStartRow - 1
        for (let col = 0; col < Object.keys(processedData[0] || {}).length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ c: col, r: headerRowNum })
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              font: { bold: true, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: '2563EB' } },
              alignment: { horizontal: 'center' }
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)

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
