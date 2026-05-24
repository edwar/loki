import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/actions/audit'

export async function GET() {
  const settings = await prisma.businessSettings.findFirst()
  return NextResponse.json({ settings })
}

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  
  const businessName = formData.get('businessName') as string
  const tin = formData.get('tin') as string | null
  const address = formData.get('address') as string | null
  const phone = formData.get('phone') as string | null
  const email = formData.get('email') as string | null
  const taxRateInput = formData.get('taxRate')
  const taxRate = taxRateInput ? parseFloat(taxRateInput as string) : 16
  const finalTaxRate = isNaN(taxRate) ? 16 : taxRate
  const currency = formData.get('currency') as string || 'COP'

  const settings = await prisma.businessSettings.findFirst()

  if (settings) {
    await prisma.businessSettings.update({
      where: { id: settings.id },
      data: { businessName, tin, address, phone, email, taxRate: finalTaxRate, currency }
    })
  } else {
    await prisma.businessSettings.create({
      data: { businessName, tin, address, phone, email, taxRate: finalTaxRate, currency }
    })
  }

  await logAction('UPDATE', 'business_settings', undefined, { businessName })

  const updatedSettings = await prisma.businessSettings.findFirst()
  return NextResponse.json({ settings: updatedSettings })
}