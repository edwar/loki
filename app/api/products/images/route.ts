import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteImage } from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const images = await prisma.productImage.findMany({
      where: { productId, deletedAt: null },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Error fetching images' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, url, publicId, items } = body

    // Soporte para batch (items) y single (url, publicId)
    const toCreate = items || [{ url, publicId }]

    const maxOrder = await prisma.productImage.findFirst({
      where: { productId, deletedAt: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    let nextOrder = (maxOrder?.order ?? -1) + 1

    const images = await Promise.all(
      toCreate.map((item: { url: string; publicId: string }) =>
        prisma.productImage.create({
          data: {
            productId,
            url: item.url,
            publicId: item.publicId,
            order: nextOrder++,
          },
        })
      )
    )

    revalidatePath('/productos')
    return NextResponse.json(images.length === 1 ? images[0] : images, { status: 201 })
  } catch (error) {
    console.error('Error saving product image:', error)
    return NextResponse.json({ error: 'Error saving image' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Image ID required' }, { status: 400 })

    const image = await prisma.productImage.findUnique({ where: { id } })
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

    await deleteImage(image.publicId)

    await prisma.productImage.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/productos')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Error deleting image' }, { status: 500 })
  }
}
