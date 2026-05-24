import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export interface BusinessSettings {
    id: string
    businessName: string
    tin: string | null
    address: string | null
    phone: string | null
    email: string | null
    taxRate: number
    currency: string
}

export function BusinessSettingsModal({ open, onClose, onSuccess, settings }: {
    open: boolean
    onClose: () => void
    onSuccess?: (settings?: any) => void
    settings: BusinessSettings
}) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const res = await fetch('/api/business-settings', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                if (onSuccess) {
                    onSuccess(data.settings)
                } else {
                    onClose()
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={open} onClose={onClose} title="Configuración Fiscal">
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre del Negocio</label>
                    <Input
                        name="businessName"
                        defaultValue={settings.businessName}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">NIT</label>
                    <Input
                        name="tin"
                        defaultValue={settings.tin || ''}
                        placeholder="123456789"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Dirección</label>
                    <Textarea
                        name="address"
                        defaultValue={settings.address || ''}
                        rows={2}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <Input
                            name="phone"
                            defaultValue={settings.phone || ''}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            name="email"
                            type="email"
                            defaultValue={settings.email || ''}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tasa de IVA (%)</label>
                        <Input
                            name="taxRate"
                            type="number"
                            step="0.01"
                            defaultValue={settings.taxRate}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Moneda</label>
                        <Select name="currency" defaultValue={settings.currency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                            <SelectItem value="USD">USD - Dólar</SelectItem>
                            <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}