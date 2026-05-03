'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Upload,
  Camera,
  FileText,
  Check,
  Loader2,
  Trash2,
  Plus,
  Minus
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface ExtractedItem {
  nombre: string
  cantidad: number
  unidad: string
  precioUnitario: number
  subtotal: number
}

const UNIDADES = ['unidad', 'gramo', 'kilogramo', 'litro', 'mililitro', 'libra', 'onza', 'pack', 'caja', 'bolsa']

interface ExtractedData {
  nombreProveedor: string
  fecha: string
  subtotal: number
  descuentoPorcentaje: number
  impuestoPorcentaje: number
  total: number
  items: ExtractedItem[]
}

export default function ComprasPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'success'>('upload')
  const [isManual, setIsManual] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [supplierName, setSupplierName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('/api/suppliers')
        if (response.ok) {
          const data = await response.json()
          setSuppliers(data)
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err)
      }
    }
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(console.error)
    }
  }, [cameraActive])

  const startCamera = async () => {
    try {
      console.log('Starting camera...')

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })

      console.log('Camera stream obtained:', mediaStream.id)

      streamRef.current = mediaStream
      setCameraActive(true)
      setError(null)
    } catch (err: any) {
      console.error('Camera error:', err)
      setError(err.message || 'No se pudo acceder a la cámara. Usa HTTPS y verifica permisos.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Cámara no lista')
      return
    }

    const video = videoRef.current

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video no está mostrando')
      return
    }

    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('No se pudo crear el contexto')
      return
    }

    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const base64 = dataUrl.split(',')[1]

    setImagePreview(dataUrl)
    stopCamera()
    processImage(base64, 'image/jpeg')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const isImage = imageTypes.includes(file.type)

    setImagePreview(URL.createObjectURL(file))

    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)

      let binary = ''
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)

      console.log('Base64 length:', base64.length)
      console.log('MimeType:', file.type)
      console.log('File size:', file.size)

      if (base64 && base64.length > 0) {
        processImage(base64, file.type)
      } else {
        setError('Error al procesar la imagen')
        setStep('upload')
      }
    } catch (err) {
      console.error('Error reading file:', err)
      setError('Error al leer el archivo')
      setStep('upload')
    }
  }

  const processImage = async (base64: string, mimeType: string) => {
    setStep('processing')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar')
      }

      const result = await response.json()
      setExtractedData(result)
      setSupplierName(result.nombreProveedor)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen')
      setStep('upload')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!extractedData) return
    setExtractedData({
      ...extractedData,
      items: [...extractedData.items, { nombre: '', cantidad: 1, unidad: 'unidad', precioUnitario: 0, subtotal: 0 }]
    })
  }

  const calculateTotal = (items: ExtractedItem[], descuentoPorcentaje: number, impuestoPorcentaje: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const descuento = subtotal * (descuentoPorcentaje / 100)
    const subtotalConDescuento = subtotal - descuento
    const impuesto = subtotalConDescuento * (impuestoPorcentaje / 100)
    return subtotalConDescuento + impuesto
  }

  const handleRemoveItem = (index: number) => {
    if (!extractedData) return
    const newItems = extractedData.items.filter((_, i) => i !== index)
    const newTotal = calculateTotal(newItems, extractedData.descuentoPorcentaje, extractedData.impuestoPorcentaje)
    const newSubtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
    setExtractedData({
      ...extractedData,
      items: newItems,
      subtotal: newSubtotal,
      total: newTotal
    })
  }

  const handleItemChange = (index: number, field: keyof ExtractedItem, value: string | number) => {
    if (!extractedData) return

    const newItems = [...extractedData.items]
    newItems[index] = { ...newItems[index], [field]: value }

    newItems[index].subtotal = newItems[index].cantidad * newItems[index].precioUnitario

    const newSubtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
    const newTotal = calculateTotal(newItems, extractedData.descuentoPorcentaje, extractedData.impuestoPorcentaje)

    setExtractedData({
      ...extractedData,
      items: newItems,
      subtotal: newSubtotal,
      total: newTotal
    })
  }

  const handleDiscountChange = (value: number) => {
    if (!extractedData) return
    const newTotal = calculateTotal(extractedData.items, value, extractedData.impuestoPorcentaje)
    setExtractedData({
      ...extractedData,
      descuentoPorcentaje: value,
      total: newTotal
    })
  }

  const handleTaxChange = (value: number) => {
    if (!extractedData) return
    const newTotal = calculateTotal(extractedData.items, extractedData.descuentoPorcentaje, value)
    setExtractedData({
      ...extractedData,
      impuestoPorcentaje: value,
      total: newTotal
    })
  }

  const handleSavePurchase = async () => {
    if (!extractedData) return

    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: supplierName,
          totalAmount: extractedData.total,
          subtotal: extractedData.subtotal,
          discountPercentage: extractedData.descuentoPorcentaje,
          taxPercentage: extractedData.impuestoPorcentaje,
          purchaseDate: new Date(extractedData.fecha),
          aiExtractedData: extractedData,
          items: extractedData.items.map(item => ({
            supplyName: item.nombre,
            quantity: item.cantidad,
            unit: item.unidad || 'unidad',
            unitPrice: item.precioUnitario,
            subtotal: item.subtotal
          }))
        })
      })

      if (!response.ok) throw new Error('Error al guardar')

      setStep('success')
    } catch (err) {
      setError('Error al guardar la compra')
    }
  }

  const resetForm = () => {
    setStep('upload')
    setIsManual(false)
    setImagePreview(null)
    setExtractedData(null)
    setSupplierName('')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Nueva Compra</h1>
        <p className="text-gray-500 dark:text-slate-400">Escanea un receipt para extraer los datos automáticamente</p>
      </div>

      {/* Step indicator */}
      <div className="flex w-full justify-center">
        <div className="flex w-full max-w-3xl justify-center items-center">
          {(isManual 
            ? [
                { step: 'review', num: '1', label: 'Registrar' },
                { step: 'success', num: '2', label: 'Guardado' }
              ]
            : [
                { step: 'upload', num: '1', label: 'Subir' },
                { step: 'processing', num: '2', label: 'Procesando' },
                { step: 'review', num: '3', label: 'Revisar' },
                { step: 'success', num: '4', label: 'Guardado' }
              ]
          ).map(({ step: s, num, label }, i, arr) => {
            const isPast = isManual 
              ? (s === 'review' && step === 'success')
              : ((s === 'upload' && ['processing', 'review', 'success'].includes(step)) ||
                 (s === 'processing' && ['review', 'success'].includes(step)) ||
                 (s === 'review' && step === 'success'))
            const isCurrent = step === s

            const getBgColor = () => {
              if (isPast) return 'bg-emerald-500 text-white'
              if (isCurrent) return 'bg-black dark:bg-white text-white dark:text-black'
              return 'bg-gray-200 dark:bg-slate-700 text-gray-500'
            }

            return (
              <div key={s} className={`flex items-center ${i < arr.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getBgColor()}`}>
                    {isPast ? <Check size={18} /> : num}
                  </div>
                  <span className={`text-xs font-medium mt-2 ${isCurrent ? 'text-black dark:text-white' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isManual
                    ? (step === 'success' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700')
                    : (['processing', 'review', 'success'].includes(step) && i < (step === 'processing' ? 0 : step === 'review' ? 1 : step === 'success' ? 2 : -1) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700')
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <Card className="bg-white dark:bg-slate-800 rounded-md p-8">
          <CardContent className="p-0">
            {/* Camera Preview */}
            {cameraActive ? (
              <div className="space-y-4">
                <div className="relative aspect-9/16 md:aspect-video bg-black rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capturar
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="secondary"
                    className="h-12 rounded-md"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={startCamera}
                    className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-md p-6 text-center hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                  >
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-md-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Tomar foto
                    </span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-md p-6 text-center hover:border-black dark:hover:border-white transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-md-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Subir archivo
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">
                      JPG, PNG, PDF, DOCX, XLSX
                    </span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.docx,.doc,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </>
            )}

            <div className="mt-8 text-center">
              <Button
                onClick={() => {
                  setStep('review')
                  setIsManual(true)
                  setExtractedData({
                    nombreProveedor: '',
                    fecha: new Date().toISOString().split('T')[0],
                    subtotal: 0,
                    descuentoPorcentaje: 0,
                    impuestoPorcentaje: 0,
                    total: 0,
                    items: [{ nombre: '', cantidad: 1, unidad: 'unidad', precioUnitario: 0, subtotal: 0 }]
                  })
                  setSupplierName('')
                  setImagePreview(null)
                  setError(null)
                }}
                variant="secondary"
                className="h-10 rounded-md"
              >
                <FileText className="w-4 h-4 mr-2" />
                Registrar compra manualmente
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <Card className="bg-white dark:bg-slate-800 rounded-md p-8">
          <CardContent className="p-0 text-center py-12">
            <div className="w-20 h-20 bg-black dark:bg-white rounded-md-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-white dark:text-black animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Procesando receipt...
            </h3>
            <p className="text-gray-500 dark:text-slate-400">
              La IA está analizando la imagen para extraer los datos
            </p>

            {imagePreview && (
              <div className="mt-8 max-w-xs mx-auto">
                <img
                  src={imagePreview}
                  alt="Receipt"
                  className="rounded-md border border-gray-200 dark:border-slate-600"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Step */}
      {step === 'review' && extractedData && (
        <div className="space-y-6">
          {/* Image Preview - Only show if there's an image */}
          {imagePreview && (
            <Card className="bg-white dark:bg-slate-800 rounded-md p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Receipt"
                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Receipt escaneado</p>
                    <p className="text-xs text-gray-400">Los datos fueron extraídos automáticamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supplier */}
          <Card className="bg-white dark:bg-slate-800 rounded-md p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-semibold text-black dark:text-white">
                Datos del Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                  Nombre del Proveedor
                </label>
                <Input
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="h-12"
                  placeholder="Nombre del proveedor"
                  list="suppliers-list"
                />
                <datalist id="suppliers-list">
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="bg-white dark:bg-slate-800 rounded-md p-6">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-black dark:text-white">
                Items de la Compra
              </CardTitle>
              <Button
                onClick={handleAddItem}
                variant="secondary"
                className="h-10 rounded-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Item
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {extractedData.items.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No se detectaron items</p>
              ) : (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase px-2">
                    <div className="col-span-3">Producto</div>
                    <div className="col-span-2">Cantidad</div>
                    <div className="col-span-2">Unidad</div>
                    <div className="col-span-2">Precio</div>
                    <div className="col-span-1">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {extractedData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-md">
                      <div className="col-span-3">
                        <Input
                          value={item.nombre}
                          onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                          className="h-9"
                          placeholder="Producto"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={item.cantidad.toLocaleString('es-CO')}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\./g, '')
                            const val = parseInt(raw, 10) || 0
                            handleItemChange(index, 'cantidad', val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className="h-9 text-right"
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          value={item.unidad || 'unidad'}
                          onValueChange={(value) => handleItemChange(index, 'unidad', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIDADES.map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={item.precioUnitario.toLocaleString('es-CO')}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\./g, '')
                            const val = parseFloat(raw) || 0
                            handleItemChange(index, 'precioUnitario', val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className="h-9 text-right font-medium"
                        />
                      </div>
                      <div className="col-span-1 text-right font-medium text-black dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-md-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtotal, Descuento, Impuesto */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-slate-400">Subtotal</span>
                  <span className="text-black dark:text-white font-medium">
                    {formatCurrency(extractedData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-slate-400">Descuento</span>
                    <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-0.5">
                      <button
                        onClick={() => handleDiscountChange(Math.max(0, extractedData.descuentoPorcentaje - 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all active:scale-90 disabled:opacity-30"
                        disabled={extractedData.descuentoPorcentaje <= 0}
                      >
                        <Minus size={14} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <input
                        type="number"
                        value={extractedData.descuentoPorcentaje}
                        onChange={(e) => handleDiscountChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        onFocus={(e) => e.target.select()}
                        className="w-8 text-center font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black dark:text-white"
                      />
                      <button
                        onClick={() => handleDiscountChange(Math.min(100, extractedData.descuentoPorcentaje + 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all active:scale-90 disabled:opacity-30"
                        disabled={extractedData.descuentoPorcentaje >= 100}
                      >
                        <Plus size={14} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <span className="text-gray-500">%</span>
                  </div>
                  <span className="text-rose-500">
                    -{formatCurrency(extractedData.subtotal * (extractedData.descuentoPorcentaje / 100))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-slate-400">Impuesto/IVA</span>
                    <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-0.5">
                      <button
                        onClick={() => handleTaxChange(Math.max(0, extractedData.impuestoPorcentaje - 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all active:scale-90 disabled:opacity-30"
                        disabled={extractedData.impuestoPorcentaje <= 0}
                      >
                        <Minus size={14} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <input
                        type="number"
                        value={extractedData.impuestoPorcentaje}
                        onChange={(e) => handleTaxChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        onFocus={(e) => e.target.select()}
                        className="w-8 text-center font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black dark:text-white"
                      />
                      <button
                        onClick={() => handleTaxChange(Math.min(100, extractedData.impuestoPorcentaje + 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all active:scale-90 disabled:opacity-30"
                        disabled={extractedData.impuestoPorcentaje >= 100}
                      >
                        <Plus size={14} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <span className="text-gray-500">%</span>
                  </div>
                  <span className="text-gray-500">
                    +{formatCurrency((extractedData.subtotal - extractedData.subtotal * (extractedData.descuentoPorcentaje / 100)) * (extractedData.impuestoPorcentaje / 100))}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-slate-600">
                  <span className="text-lg font-semibold text-black dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(extractedData.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={resetForm}
              variant="secondary"
              className="flex-1 h-12 rounded-md"
            >
              ESCANEAR OTRO
            </Button>
            <Button
              onClick={handleSavePurchase}
              className="flex-1 h-12 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-md"
            >
              GUARDAR COMPRA
            </Button>
          </div>
        </div>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <Card className="bg-white dark:bg-slate-800 rounded-md p-8">
          <CardContent className="p-0 text-center py-12">
            <div className="w-20 h-20 bg-emerald-500 rounded-md-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Compra guardada correctamente
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-8">
              Los items han sido agregados al inventario
            </p>
            <Button
              onClick={() => router.push('/insumos')}
              className="bg-black dark:bg-white text-white dark:text-black rounded-md"
            >
              VER INVENTARIO
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'