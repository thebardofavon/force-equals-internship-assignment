'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { AuthButton } from '../components/AuthButton'
import Link from 'next/link'

export default function SellerDashboard() {
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false)

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

  const updateToSeller = async () => {
    if (!session?.user?.email) return

    setRoleUpdateLoading(true)
    try {
      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          role: 'seller',
        }),
      })

      if (response.ok) {
        window.location.reload() // Refresh to update session
      }
    } catch (error) {
      console.error('Failed to update role:', error)
    } finally {
      setRoleUpdateLoading(false)
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
            <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
            <p className="text-gray-600 mb-6">Please sign in to access your seller dashboard</p>
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
              <Link href="/" className="text-xl font-bold text-blue-600">
                Calendar Scheduler
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold">Seller Dashboard</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Role Check */}
        {session.user?.role !== 'seller' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Switch to Seller Mode
            </h2>
            <p className="text-yellow-700 mb-4">
              You're currently registered as a buyer. Switch to seller mode to share your calendar availability.
            </p>
            <button
              onClick={updateToSeller}
              disabled={roleUpdateLoading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-yellow-300"
            >
              {roleUpdateLoading ? 'Updating...' : 'Become a Seller'}
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.name}!</h2>
              <p className="text-gray-600 mb-4">
                As a seller, buyers can book appointments with you based on your calendar availability.
              </p>
              
              {session.user?.role === 'seller' && (
                <div className="flex space-x-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex-1">
                    <h3 className="font-medium text-green-800">Calendar Connected</h3>
                    <p className="text-sm text-green-600">Your Google Calendar is integrated</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1">
                    <h3 className="font-medium text-blue-800">Ready for Bookings</h3>
                    <p className="text-sm text-blue-600">Buyers can now book with you</p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
              {loading ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments yet. Share your calendar link with buyers!
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.title}</h3>
                          <p className="text-sm text-gray-600">
                            with {appointment.buyer?.name} ({appointment.buyer?.email})
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(appointment.start_time).toLocaleDateString()} at{' '}
                            {new Date(appointment.start_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/appointments"
                  className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Appointments
                </Link>
                <Link
                  href="/buyer"
                  className="block w-full bg-gray-600 text-white text-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Switch to Buyer View
                </Link>
              </div>
            </div>

            {session.user?.role === 'seller' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Your Booking Link</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Share this link with potential buyers:
                </p>
                <div className="bg-gray-50 p-3 rounded border text-sm break-all">
                  {window.location.origin}/buyer?seller={session.user.id}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}