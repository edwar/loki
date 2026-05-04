'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { headers } from 'next/headers'

export async function logAction(
  action: string,
  entity: string,
  entityId?: string,
  details?: any
) {
  try {
    const session = await getServerSession(authOptions)
    const headersList = await headers()
    
    // Attempt to get IP if available in headers, fallback if not
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      null

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || 'System / Unauthenticated',
        action,
        entity,
        entityId,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        ipAddress
      }
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
    // We don't throw here to avoid breaking the main user action if audit logging fails
  }
}

export async function getAuditLogs() {
  const session = await getServerSession(authOptions)
  
  // Basic check for admin access
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized access to audit logs')
  }

  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100 // Get latest 100 logs
  })
}
