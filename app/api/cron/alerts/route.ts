import { NextRequest, NextResponse } from 'next/server'
import { generateAlerts } from '@/lib/actions/alerts'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.CRON_SECRET

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await generateAlerts()
  return NextResponse.json(result)
}
