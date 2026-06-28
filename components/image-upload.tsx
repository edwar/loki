'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImage {
  id: string
  url: string
  publicId: string
  order: number
}

interface ImageUploadProps {
  productId: string
  images: ProductImage[]
  onImagesChange: () => void
}

export function ImageUpload({ productId, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('file', file)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { url, publicId } = await uploadRes.json()

      const saveRes = await fetch('/api/products/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, url, publicId }),
      })
      if (!saveRes.ok) throw new Error('Save failed')

      onImagesChange()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (imageId: string) => {
    await fetch(`/api/products/images?id=${imageId}`, { method: 'DELETE' })
    onImagesChange()
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Imágenes del Producto</label>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border/50">
            <img
              src={img.url}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        ))}
        <label
          className={cn(
            "flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/50 transition-colors bg-muted/20",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="w-6 h-6 text-muted-foreground" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  )
}
