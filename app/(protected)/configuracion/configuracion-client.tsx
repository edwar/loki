'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateMyCompany } from '@/lib/actions/companies'
import { createPaymentMethod, deletePaymentMethod } from '@/lib/actions/payment-methods'
import { Building2, Globe, Phone, Mail, MapPin, ImagePlus, Wallet, Plus, Trash2 } from 'lucide-react'
import { sileo as toast } from 'sileo'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  isActive: boolean
}

export function ConfiguracionClient({ company }: { company: Company | null }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [logo, setLogo] = useState(company?.logo ?? '')
  const [newMethodName, setNewMethodName] = useState('')
  const [addingMethod, setAddingMethod] = useState(false)

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await fetch('/api/payment-methods')
      if (!res.ok) return []
      return res.json()
    },
  })

  const handleAddMethod = async () => {
    if (!newMethodName.trim()) return
    setAddingMethod(true)
    try {
      const fd = new FormData()
      fd.set('name', newMethodName.trim())
      await createPaymentMethod(fd)
      setNewMethodName('')
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success({ title: 'Método de pago agregado' })
    } catch (err: any) {
      toast.error({ title: err.message || 'Error al agregar' })
    } finally {
      setAddingMethod(false)
    }
  }

  const handleDeleteMethod = async (id: string) => {
    try {
      await deletePaymentMethod(id)
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success({ title: 'Método de pago eliminado' })
    } catch {
      toast.error({ title: 'Error al eliminar' })
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fd = new FormData()
      fd.set('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setLogo(data.url)
    } catch {
      toast.error({ title: 'Error al subir logo' })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    fd.set('logo', logo)
    try {
      await updateMyCompany(fd)
      toast.success({ title: 'Compañía actualizada' })
      router.refresh()
    } catch {
      toast.error({ title: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const storeUrl = company ? `${window.location.origin}/tienda/${company.slug}` : null

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-display">Configuración</h1>
        <p className="text-muted-foreground font-medium mt-1">Información de tu compañía y tienda pública</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Company Info */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-card/30">
            <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center overflow-hidden shrink-0">
              {logo ? (
                <img src={logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <label className="cursor-pointer text-sm text-primary font-medium flex items-center gap-2">
                <ImagePlus className="w-4 h-4" /> Subir logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG. Recomendado: 512x512px</p>
            </div>
          </div>

          {storeUrl && (
            <a
              href={storeUrl}
              target="_blank"
              className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Globe className="w-4 h-4 text-primary" />
              Tu tienda pública: <span className="text-primary font-bold underline">{storeUrl}</span>
            </a>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre</label>
              <Input name="name" defaultValue={company?.name} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Slug</label>
              <Input value={company?.slug ?? ''} disabled className="bg-muted/50" />
              <p className="text-[10px] text-muted-foreground">URL de tu tienda: /tienda/{company?.slug}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descripción</label>
            <Input name="description" defaultValue={company?.description ?? ''} placeholder="Breve descripción de tu negocio" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> WhatsApp
              </label>
              <Input name="whatsapp" defaultValue={company?.whatsapp ?? ''} placeholder="+573001234567" />
              <p className="text-[10px] text-muted-foreground">Recibirás notificaciones de pedidos aquí</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email
              </label>
              <Input name="email" defaultValue={company?.email ?? ''} type="email" placeholder="tienda@ejemplo.com" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Dirección
            </label>
            <Input name="address" defaultValue={company?.address ?? ''} placeholder="Dirección del negocio" />
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto h-12 px-8 rounded-lg font-bold">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>

        {/* Payment Methods */}
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wallet size={20} className="text-primary" />
              Métodos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {paymentMethods.map((pm: any) => (
                <div key={pm.id} className="flex items-center justify-between px-8 py-4 hover:bg-muted/30 transition-colors">
                  <span className="font-medium">{pm.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMethod(pm.id)}
                    className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="px-8 py-4 border-t border-border/30 bg-muted/10">
              <div className="flex gap-2">
                <Input
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  placeholder="Nuevo método de pago..."
                  className="h-10"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMethod())}
                />
                <Button
                  onClick={handleAddMethod}
                  disabled={addingMethod || !newMethodName.trim()}
                  className="h-10 px-4 rounded-lg shrink-0"
                >
                  <Plus size={18} />
                  Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
