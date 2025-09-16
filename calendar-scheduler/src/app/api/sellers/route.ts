import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: sellers, error } = await supabase
      .from('users')
      .select('id, name, email, image')
      .eq('role', 'seller')

    if (error) throw error

    return NextResponse.json(sellers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 })
  }
}