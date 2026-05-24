import { getDashboardData } from '@/lib/actions/dashboard'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '30d'

  try {
    const data = await getDashboardData(range)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Error al obtener datos del dashboard' }, { status: 500 })
  }
}
