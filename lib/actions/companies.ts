'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = slugify(base) || 'tienda'
  let counter = 0
  while (await prisma.company.findUnique({ where: { slug } })) {
    counter++
    slug = `${slugify(base)}-${counter}`
  }
  return slug
}

async function ensureUserCompany(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  })

  if (!user) return null

  if (!user.companyId || !user.company) {
    const slug = await generateUniqueSlug(user.name)
    const company = await prisma.company.create({
      data: {
        name: user.name,
        slug,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { companyId: company.id },
    })

    return company
  }

  return user.company
}

export async function getUserCompany() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  return ensureUserCompany(session.user.id)
}

export async function updateMyCompany(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('No autenticado')

  const company = await ensureUserCompany(session.user.id)
  if (!company) throw new Error('Sin compañía')

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const whatsapp = formData.get('whatsapp') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  const logo = formData.get('logo') as string

  const slug = name !== company.name
    ? await generateUniqueSlug(name)
    : company.slug

  await prisma.company.update({
    where: { id: company.id },
    data: { name, slug, description, whatsapp, email, address, logo },
  })

  revalidatePath('/configuracion')
}
