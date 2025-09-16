'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { AuthButton } from '../components/AuthButton'
import Link from 'next/link'

interface Appointment {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled'
  seller?: { name: string; email: string; image?: string }
  buyer?: { name: string; email: string; image?: string }
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    if (session?.user?.id) {
      fetchAppointments()
    }
  }, [session])

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments?userId=${session?.user?.id}`)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          status: 'cancelled',
        }),
      })

      if (response.ok) {
        fetchAppointments() // Refresh the list
      } else {
        alert('Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      alert('Failed to cancel appointment')
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const now = new Date()
    const appointmentDate = new Date(appointment.start_time)

    switch (filter) {
      case 'upcoming':
        return appointmentDate > now && appointment.status === 'confirmed'
      case 'past':
        return appointmentDate <= now
      case 'all':
      default:
        return true
    }
  })

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
            <h1 className="text-2xl font-bold mb-4">Appointments</h1>
            <p className="text-gray-600 mb-6">Please sign in to view your appointments</p>
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
              <Link href="/" className="text-xl font-bold text-purple-600">
                Calendar Scheduler
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold">My Appointments</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            {[
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="text-center py-12">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No appointments found
              </h2>
              <p className="text-gray-500 mb-6">
                {filter === 'upcoming' 
                  ? "You don't have any upcoming appointments."
                  : filter === 'past'
                  ? "You don't have any past appointments."
                  : "You haven't scheduled any appointments yet."
                }
              </p>
              <div className="space-x-4">
                <Link
                  href="/buyer"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/seller"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAppointments.map((appointment) => {
                const isUpcoming = new Date(appointment.start_time) > new Date()
                const isBuyer = appointment.buyer?.email === session.user?.email
                const otherPerson = isBuyer ? appointment.seller : appointment.buyer
                const role = isBuyer ? 'buyer' : 'seller'

                return (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{appointment.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'confirmed'
                              ? isUpcoming 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status === 'confirmed' 
                              ? isUpcoming ? 'Upcoming' : 'Completed'
                              : 'Cancelled'
                            }
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium mb-1">
                              📅 {new Date(appointment.start_time).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="mb-1">
                              ⏰ {new Date(appointment.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              - {new Date(appointment.end_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p>
                              👤 {role === 'buyer' ? 'Meeting with' : 'Booked by'}: {otherPerson?.name} ({otherPerson?.email})
                            </p>
                          </div>
                          {appointment.description && (
                            <div>
                              <p className="font-medium mb-1">Description:</p>
                              <p className="text-gray-600">{appointment.description}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {isUpcoming && appointment.status === 'confirmed' && (
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center space-x-4">
          <Link
            href="/buyer"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Book New Appointment
          </Link>
          <Link
            href="/seller"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Seller Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}