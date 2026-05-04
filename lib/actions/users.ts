'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { logAction } from './audit'

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
    let userId;

    if (existing && existing.deletedAt) {
      // Recover logically deleted user
      const updatedUser = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          password: hashedPassword,
          role: data.role,
          deletedAt: null
        }
      })
      userId = updatedUser.id;
      await logAction('RECOVER_USER', 'USER', userId, { email: data.email, role: data.role })
    } else {
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role
        }
      })
      userId = newUser.id;
      await logAction('CREATE', 'USER', userId, { email: data.email, role: data.role })
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
    const oldUser = await prisma.user.findUnique({ where: { id } })
    await prisma.user.update({
      where: { id },
      data: { role }
    })
    
    await logAction('UPDATE_ROLE', 'USER', id, { oldRole: oldUser?.role, newRole: role, email: oldUser?.email })

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
    
    await logAction('DELETE', 'USER', id, { email: user?.email, role: user?.role })

    revalidatePath('/equipo')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Error al eliminar el usuario' }
  }
}
