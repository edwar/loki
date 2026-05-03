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
  Package,
  Trash2,
  Plus,
  X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface ExtractedItem {
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

interface ExtractedData {
  nombreProveedor: string
  fecha: string
  total: number
  items: ExtractedItem[]
}

export default function ComprasPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'success'>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [supplierName, setSupplierName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      console.log('Starting camera...')
      
      // Try different camera configurations
      const configs = [
        { facingMode: 'environment' },
        { facingMode: 'user' },
        { facingMode: { ideal: 'environment' } },
        {}
      ]
      
      let mediaStream = null
      for (const config of configs) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: config,
            audio: false
          })
          console.log('Camera found with config:', config)
          break
        } catch (e) {
          console.log('Config failed:', config, e)
        }
      }
      
      if (!mediaStream) {
        // Last attempt - any video
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      }
      
      console.log('Camera stream obtained:', mediaStream.id)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        console.log('Stream assigned to video')
      }
      
      setStream(mediaStream)
      setCameraActive(true)
      setError(null)
    } catch (err) {
      console.error('Camera error:', err)
      setError('No se pudo acceder a la cámara. Asegurate de estar usando HTTPS y tener permisos.')
    }
  }

  const onVideoLoaded = () => {
    if (videoRef.current) {
      console.log('Video ready - width:', videoRef.current.videoWidth, 'height:', videoRef.current.videoHeight)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Cámara no lista')
      return
    }
    
    const video = videoRef.current
    
    // Wait for video to be ready if needed
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Waiting for video to be ready...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video no está mostrando. Recargá la página e intentá de nuevo.')
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
    
    // Get base64 from canvas
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const base64 = dataUrl.split(',')[1]
    
    console.log('Photo base64 length:', base64?.length)
    
    if (!base64 || base64.length === 0) {
      setError('Error al convertir la foto')
      return
    }
    
    setImagePreview(dataUrl)
    stopCamera()
    processImage(base64, 'image/jpeg')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Convertir a base64 usando array buffer
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      
      // Convertir a base64 manualmente
      let binary = ''
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)
      
      console.log('Base64 length:', base64.length)
      console.log('MimeType:', file.type)
      console.log('File size:', file.size)
      
      setImagePreview(URL.createObjectURL(file))
      
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
      items: [...extractedData.items, { nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]
    })
  }

  const handleRemoveItem = (index: number) => {
    if (!extractedData) return
    const newItems = extractedData.items.filter((_, i) => i !== index)
    const newTotal = newItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    setExtractedData({
      ...extractedData,
      items: newItems,
      total: newTotal
    })
  }

  const handleItemChange = (index: number, field: keyof ExtractedItem, value: string | number) => {
    if (!extractedData) return
    
    const newItems = [...extractedData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalcular subtotal
    newItems[index].subtotal = newItems[index].cantidad * newItems[index].precioUnitario
    
    const newTotal = newItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    
    setExtractedData({
      ...extractedData,
      items: newItems,
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
          purchaseDate: new Date(extractedData.fecha),
          aiExtractedData: extractedData,
          items: extractedData.items.map(item => ({
            supplyName: item.nombre,
            quantity: item.cantidad,
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
      <div className="flex items-center gap-4">
        {['upload', 'processing', 'review', 'success'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s 
                ? 'bg-black dark:bg-white text-white dark:text-black' 
                : i < ['upload', 'processing', 'review', 'success'].indexOf(step)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
            }`}>
              {i < ['upload', 'processing', 'review', 'success'].indexOf(step) ? <Check size={16} /> : i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'text-black dark:text-white font-medium' : 'text-gray-400'}`}>
              {s === 'upload' && 'Subir'}
              {s === 'processing' && 'Procesando'}
              {s === 'review' && 'Revisar'}
              {s === 'success' && 'Guardado'}
            </span>
            {i < 3 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-8">
          <CardContent className="p-0">
            {/* Camera Preview */}
            {cameraActive ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    onLoadedMetadata={onVideoLoaded}
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={capturePhoto}
                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capturar
                  </Button>
                  <Button 
                    onClick={stopCamera}
                    variant="secondary"
                    className="h-12 rounded-2xl"
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
                    className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-6 text-center hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                  >
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Tomar foto
                    </span>
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-6 text-center hover:border-black dark:hover:border-white transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Subir archivo
                    </span>
                  </button>
                </div>
                
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-8 text-center cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Subir imagen del receipt
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400">
                    Arrastra o selecciona una imagen
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Formatos: JPG, PNG, WEBP
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-8">
          <CardContent className="p-0 text-center py-12">
            <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
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
                  className="rounded-xl border border-gray-200 dark:border-slate-600"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Step */}
      {step === 'review' && extractedData && (
        <div className="space-y-6">
          {/* Image Preview */}
          <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Receipt" 
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                  />
                )}
                <div>
                  <p className="text-sm text-gray-500">Receipt escaneado</p>
                  <p className="text-xs text-gray-400">Los datos fueron extraídos automáticamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier */}
          <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-6">
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-6">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-black dark:text-white">
                Items de la Compra
              </CardTitle>
              <Button 
                onClick={handleAddItem}
                variant="secondary"
                className="h-10 rounded-2xl"
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
                    <div className="col-span-4">Producto</div>
                    <div className="col-span-2">Cantidad</div>
                    <div className="col-span-2">Precio</div>
                    <div className="col-span-2">Subtotal</div>
                    <div className="col-span-2"></div>
                  </div>

                  {extractedData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="col-span-4">
                        <Input
                          value={item.nombre}
                          onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                          className="h-9"
                          placeholder="Producto"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value) || 0)}
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.precioUnitario}
                          onChange={(e) => handleItemChange(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-2 text-right font-medium text-black dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
                <div className="flex justify-between items-center">
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
              className="flex-1 h-12 rounded-2xl"
            >
              EscANEAR OTRO
            </Button>
            <Button 
              onClick={handleSavePurchase}
              className="flex-1 h-12 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-2xl"
            >
              GUARDAR COMPRA
            </Button>
          </div>
        </div>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <Card className="bg-white dark:bg-slate-800 rounded-[24px] p-8">
          <CardContent className="p-0 text-center py-12">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
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
              className="bg-black dark:bg-white text-white dark:text-black rounded-2xl"
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