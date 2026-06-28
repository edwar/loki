import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { TiendaClient } from './tienda-client'

export const dynamic = 'force-dynamic'

export default async function TiendaPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params

  const company = await prisma.company.findUnique({
    where: { slug, deletedAt: null, isActive: true },
  })

  if (!company) notFound()

  const products = await prisma.product.findMany({
    where: {
      companyId: company.id,
      deletedAt: null,
      isActive: true,
      isPublic: true,
    },
    include: {
      images: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      },
      recipeItems: {
        where: { deletedAt: null },
        include: { supply: { select: { name: true, unit: true, purchasePrice: true } } },
      },
    },
    orderBy: { name: 'asc' },
  })

  const serializedCompany = {
    name: company.name,
    slug: company.slug,
    logo: company.logo,
    description: company.description,
    whatsapp: company.whatsapp,
    address: company.address,
  }

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    salePrice: Number(p.salePrice),
    currentStock: Number(p.currentStock),
    images: (p.images || []).map((i) => ({ url: i.url, publicId: i.publicId })),
    ingredients: (p.recipeItems || []).map((ri) => ({
      name: ri.supply?.name || '',
      quantity: Number(ri.quantityRequired),
      unit: ri.unit,
    })),
  }))

  return <TiendaClient company={serializedCompany} products={serializedProducts} />
}
