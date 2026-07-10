import { NextResponse } from 'next/server'
import { listPublicEvents } from '@/lib/supabase-events'

export async function GET() {
  const payload = await listPublicEvents()
  return NextResponse.json(payload)
}
