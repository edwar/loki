'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function createUser(data: any) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existing && !existing.deletedAt) {
      return { success: false, error: 'El correo ya está registrado' }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    if (existing && existing.deletedAt) {
      // Recover logically deleted user
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          password: hashedPassword,
          role: data.role,
          deletedAt: null
        }
      })
    } else {
      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role
        }
      })
    }

    revalidatePath('/equipo')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message || 'Error al crear usuario' }
  }
}

export async function updateUserRole(id: string, role: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { role }
    })
    
    revalidatePath('/equipo')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Error al actualizar el rol' }
  }
}

export async function deleteUser(id: string) {
  try {
    // Prevent deleting the last admin
    const admins = await prisma.user.count({
      where: { role: 'admin', deletedAt: null }
    })
    
    const user = await prisma.user.findUnique({ where: { id } })
    
    if (admins <= 1 && user?.role === 'admin') {
      return { success: false, error: 'No se puede eliminar al último administrador' }
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    
    revalidatePath('/equipo')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Error al eliminar el usuario' }
  }
}
