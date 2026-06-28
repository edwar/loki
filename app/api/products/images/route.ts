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
    const { productId, url, publicId } = await request.json()

    const maxOrder = await prisma.productImage.findFirst({
      where: { productId, deletedAt: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        publicId,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    revalidatePath('/productos')
    return NextResponse.json(image, { status: 201 })
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
