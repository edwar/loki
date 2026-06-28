import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { companySlug, customerName, customerPhone, customerNotes, items } = await request.json()

    const company = await prisma.company.findUnique({
      where: { slug: companySlug, deletedAt: null, isActive: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    let totalAmount = 0
    const orderItems = await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId, deletedAt: null, isActive: true },
        })
        if (!product) throw new Error(`Product ${item.productId} not found`)

        const unitPrice = Number(product.salePrice) || 0
        const subtotal = unitPrice * item.quantity
        totalAmount += subtotal

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        }
      })
    )

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        customerName,
        customerPhone,
        customerNotes,
        totalAmount,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    // Intentar enviar WhatsApp notification
    if (company.whatsapp) {
      const orderRef = order.id.slice(0, 8).toUpperCase()
      const message = encodeURIComponent(
        `🛒 *Nueva Orden #${orderRef}*\n\nCliente: ${customerName}\nTel: ${customerPhone}\n${customerNotes ? `Notas: ${customerNotes}\n` : ''}\nTotal: $${totalAmount.toLocaleString()}\n\nRevisa el detalle en tu panel.`
      )
      fetch(`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, { method: 'GET' }).catch(() => {})
    }

    // Intentar enviar WhatsApp al cliente con su número de orden
    if (customerPhone) {
      const orderRef = order.id.slice(0, 8).toUpperCase()
      const clientMessage = encodeURIComponent(
        `¡Hola ${customerName}! 🎉\n\nTu orden *${orderRef}* fue recibida correctamente. Pronto nos pondremos en contacto contigo para confirmar los detalles.\n\n¡Gracias por tu pedido!`
      )
      fetch(`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${clientMessage}`, { method: 'GET' }).catch(() => {})
    }

    return NextResponse.json({ id: order.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
  }
}
