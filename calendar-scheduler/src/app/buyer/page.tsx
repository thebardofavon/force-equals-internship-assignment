'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { AuthButton } from '../components/AuthButton'
import Link from 'next/link'

interface Seller {
  id: string
  name: string
  email: string
  image?: string
}

interface TimeSlot {
  start: string
  end: string
}

export default function BuyerDashboard() {
  const { data: session, status } = useSession()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchSellers()
  }, [])

  useEffect(() => {
    if (selectedSeller && selectedDate) {
      fetchAvailability()
    }
  }, [selectedSeller, selectedDate])

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers')
      const data = await response.json()
      setSellers(data)
    } catch (error) {
      console.error('Failed to fetch sellers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    if (!selectedSeller) return

    setSlotsLoading(true)
    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: selectedSeller.id,
          date: selectedDate,
        }),
      })
      const data = await response.json()
      setAvailableSlots(data.availableSlots || [])
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      setAvailableSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  const bookAppointment = async (slot: TimeSlot) => {
    if (!session?.user?.id || !selectedSeller) return

    setBookingLoading(slot.start)
    try {
      const response = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: selectedSeller.id,
          buyerId: session.user.id,
          startTime: slot.start,
          endTime: slot.end,
          title: `Meeting with ${session.user.name}`,
          description: `Scheduled meeting between ${session.user.name} and ${selectedSeller.name}`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert('Appointment booked successfully!')
        fetchAvailability() // Refresh availability
      } else {
        const error = await response.json()
        alert(`Failed to book appointment: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to book appointment:', error)
      alert('Failed to book appointment')
    } finally {
      setBookingLoading(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>
            <p className="text-gray-600 mb-6">Please sign in to book appointments</p>
            <AuthButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-green-600">
                Calendar Scheduler
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold">Buyer Dashboard</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seller Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Select a Seller</h2>
            {loading ? (
              <div className="text-center py-4">Loading sellers...</div>
            ) : sellers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No sellers available</div>
            ) : (
              <div className="space-y-3">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSeller?.id === seller.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSeller(seller)}
                  >
                    <div className="flex items-center space-x-3">
                      {seller.image && (
                        <img
                          src={seller.image}
                          alt={seller.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{seller.name}</h3>
                        <p className="text-sm text-gray-600">{seller.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Selection and Availability */}
          <div className="lg:col-span-2">
            {selectedSeller ? (
              <>
                {/* Date Picker */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Book with {selectedSeller.name}
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Available Time Slots */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
                  {slotsLoading ? (
                    <div className="text-center py-8">Loading availability...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for this date
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => bookAppointment(slot)}
                          disabled={bookingLoading === slot.start}
                          className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <div className="text-sm font-medium">
                            {new Date(slot.start).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(slot.end).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {bookingLoading === slot.start && (
                            <div className="text-xs text-gray-500 mt-1">Booking...</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome, {session.user?.name}!</h2>
                <p className="text-gray-600">Select a seller to view their availability and book an appointment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/appointments"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View My Appointments
          </Link>
          <Link
            href="/seller"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Switch to Seller View
          </Link>
        </div>
      </div>
    </div>
  )
}