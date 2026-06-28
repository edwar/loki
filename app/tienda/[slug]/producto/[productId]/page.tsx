import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { ProductoDetalleClient } from './producto-detalle-client'

export const dynamic = 'force-dynamic'

export default async function ProductoDetallePage(props: {
  params: Promise<{ slug: string; productId: string }>
}) {
  const { slug, productId } = await props.params

  const company = await prisma.company.findUnique({
    where: { slug, deletedAt: null, isActive: true },
  })
  if (!company) notFound()

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
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
  })
  if (!product) notFound()

  const serialized = {
    id: product.id,
    name: product.name,
    salePrice: Number(product.salePrice),
    currentStock: Number(product.currentStock),
    images: product.images.map((i) => ({ url: i.url, publicId: i.publicId })),
    ingredients: product.recipeItems.map((ri) => ({
      name: ri.supply?.name || '',
      quantity: Number(ri.quantityRequired),
      unit: ri.unit,
    })),
  }

  const companyInfo = {
    name: company.name,
    slug: company.slug,
    logo: company.logo,
    whatsapp: company.whatsapp,
  }

  return <ProductoDetalleClient product={serialized} company={companyInfo} />
}
