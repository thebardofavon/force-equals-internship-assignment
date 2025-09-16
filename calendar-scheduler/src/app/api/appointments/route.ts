import { NextRequest, NextResponse } from 'next/server'
import { Database } from '../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const appointments = await Database.getAppointmentsByUser(userId)
    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { appointmentId, status } = await request.json()

    if (!appointmentId || !status || !['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid appointmentId or status' },
        { status: 400 }
      )
    }

    const appointment = await Database.updateAppointmentStatus(appointmentId, status)
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}