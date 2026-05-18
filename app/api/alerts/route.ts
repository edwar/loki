import { NextResponse } from 'next/server'
import { getAlerts } from '@/lib/actions/alerts'

export async function GET() {
  try {
    const alerts = await getAlerts()
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ alerts: [], unreadCount: 0, lowStockCount: 0, highExpenseCount: 0 }, { status: 500 })
  }
}