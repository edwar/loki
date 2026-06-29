import { NextRequest, NextResponse } from 'next/server'
import { getAlerts, markAsRead, markAllAsRead, dismissAlert } from '@/lib/actions/alerts'

export async function GET() {
  try {
    const alerts = await getAlerts()
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ alerts: [], unreadCount: 0, lowStockCount: 0, highExpenseCount: 0 }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, id } = body

    if (action === 'markRead' && id) {
      const result = await markAsRead(id)
      return NextResponse.json(result)
    }
    if (action === 'markAllRead') {
      const result = await markAllAsRead()
      return NextResponse.json(result)
    }
    if (action === 'dismiss' && id) {
      const result = await dismissAlert(id)
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in PATCH alerts:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
