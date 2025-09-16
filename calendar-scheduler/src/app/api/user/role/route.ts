import { NextRequest, NextResponse } from 'next/server'
import { Database } from '../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    if (!email || !role || !['buyer', 'seller'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid email or role' },
        { status: 400 }
      )
    }

    const user = await Database.updateUserRole(email, role)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}