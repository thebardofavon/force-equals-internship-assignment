import { NextRequest, NextResponse } from 'next/server'
import { CalendarService } from '../../../lib/calendar'
import { Database } from '../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { sellerId, buyerId, startTime, endTime, title, description } = await request.json()

    if (!sellerId || !buyerId || !startTime || !endTime || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get seller and buyer information
    const [seller, buyer] = await Promise.all([
      Database.getUserById(sellerId),
      Database.getUserById(buyerId),
    ])

    if (!seller || !buyer) {
      return NextResponse.json(
        { error: 'Seller or buyer not found' },
        { status: 404 }
      )
    }

    if (!seller.google_access_token) {
      return NextResponse.json(
        { error: 'Seller not authenticated with Google Calendar' },
        { status: 400 }
      )
    }

    // Create calendar service for seller
    const sellerCalendarService = new CalendarService(seller.google_access_token)

    // Create event details
    const eventDetails = {
      summary: title,
      description: description || `Meeting between ${buyer.name} and ${seller.name}`,
      start: {
        dateTime: startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      attendees: [
        { email: seller.email },
        { email: buyer.email },
      ],
    }

    // Create event in seller's calendar
    const sellerEvent = await sellerCalendarService.createEvent(eventDetails)

    // If buyer has Google Calendar connected, create event in their calendar too
    let buyerEvent = null
    if (buyer.google_access_token) {
      try {
        const buyerCalendarService = new CalendarService(buyer.google_access_token)
        buyerEvent = await buyerCalendarService.createEvent(eventDetails)
      } catch (error) {
        console.error('Failed to create event in buyer calendar:', error)
        // Continue even if buyer event creation fails
      }
    }

    // Save appointment to database
    const appointment = await Database.createAppointment({
      seller_id: sellerId,
      buyer_id: buyerId,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      google_event_id: sellerEvent.id,
    })

    return NextResponse.json({
      appointment,
      sellerEventId: sellerEvent.id,
      buyerEventId: buyerEvent?.id,
      meetingLink: sellerEvent.hangoutLink,
    })
  } catch (error) {
    console.error('Error booking appointment:', error)
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
}