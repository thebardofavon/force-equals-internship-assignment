import { NextRequest, NextResponse } from 'next/server'
import { CalendarService } from '@/lib/calendar'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { sellerId, date } = await request.json()
    
    // Get seller's access token from database
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    
    const { data: seller, error } = await supabase
      .from('users')
      .select('google_access_token')
      .eq('id', sellerId)
      .single()

    if (error || !seller?.google_access_token) {
      return NextResponse.json({ error: 'Seller not found or not authenticated' }, { status: 404 })
    }

    const calendarService = new CalendarService(seller.google_access_token)
    
    const timeMin = new Date(date).toISOString()
    const timeMax = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString()
    
    const busyTimes = await calendarService.getAvailability(timeMin, timeMax)
    
    // Generate available slots (9 AM - 5 PM, 30-min slots)
    const availableSlots = generateAvailableSlots(date, busyTimes)
    
    return NextResponse.json({ availableSlots })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

function generateAvailableSlots(date: string, busyTimes: any[]) {
  const slots = []
  const startHour = 9 // 9 AM
  const endHour = 17 // 5 PM
  const slotDuration = 30 // 30 minutes
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`)
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000)
      
      // Check if slot conflicts with busy times
      const isAvailable = !busyTimes.some(busy => {
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        return slotStart < busyEnd && slotEnd > busyStart
      })
      
      if (isAvailable) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        })
      }
    }
  }
  
  return slots
}