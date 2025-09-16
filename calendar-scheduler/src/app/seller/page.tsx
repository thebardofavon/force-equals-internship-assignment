'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { AuthButton } from '../components/AuthButton'
import Link from 'next/link'

export default function SellerDashboard() {
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    thisWeekBookings: 0
  })

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
      
      // Calculate stats
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      setStats({
        totalAppointments: data.length,
        upcomingAppointments: data.filter((apt: any) => new Date(apt.start_time) > now && apt.status === 'confirmed').length,
        thisWeekBookings: data.filter((apt: any) => {
          const aptDate = new Date(apt.start_time)
          return aptDate >= now && aptDate <= weekFromNow && apt.status === 'confirmed'
        }).length
      })
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyBookingLink = () => {
    const bookingLink = `${window.location.origin}/buyer?seller=${session?.user?.id}`
    navigator.clipboard.writeText(bookingLink)
    alert('Booking link copied to clipboard!')
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
            <div className="text-6xl mb-4">🗓️</div>
            <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Sign in with Google to manage your calendar availability and view bookings
            </p>
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
                📅 Calendar Scheduler
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold">Seller Dashboard</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {session.user?.name}!
              </h2>
              <p className="text-gray-600">
                Your calendar is connected and ready for bookings
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-xl">✅</span>
                <div>
                  <h3 className="font-medium text-green-800">Google Calendar Connected</h3>
                  <p className="text-sm text-green-600">Buyers can see your availability</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 text-xl">🔗</span>
                <div>
                  <h3 className="font-medium text-blue-800">Booking Link Active</h3>
                  <p className="text-sm text-blue-600">Share your link with potential clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Booking Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Appointments</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Upcoming</span>
                    <span className="text-2xl font-bold text-green-600">{stats.upcomingAppointments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="text-2xl font-bold text-purple-600">{stats.thisWeekBookings}</span>
                  </div>
                </div>
              </div>

              {/* Booking Link */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Booking Link</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Share this link with clients to let them book appointments:
                </p>
                <div className="bg-gray-50 p-3 rounded border text-xs break-all mb-3 font-mono">
                  {typeof window !== 'undefined' && `${window.location.origin}/buyer?seller=${session.user.id}`}
                </div>
                <button
                  onClick={copyBookingLink}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  📋 Copy Link
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/appointments"
                    className="block w-full bg-purple-600 text-white text-center px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    📅 View All Appointments
                  </Link>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-600 text-white text-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    🔗 Open Google Calendar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Recent Bookings</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments yet</h3>
                  <p className="text-gray-500 mb-6">
                    Share your booking link to start receiving appointment requests!
                  </p>
                  <button
                    onClick={copyBookingLink}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📋 Copy Booking Link
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {appointments
                    .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                    .slice(0, 10) // Show only latest 10
                    .map((appointment: any) => {
                      const isUpcoming = new Date(appointment.start_time) > new Date()
                      return (
                        <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{appointment.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                👤 {appointment.buyer?.name} ({appointment.buyer?.email})
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>
                                  📅 {new Date(appointment.start_time).toLocaleDateString()}
                                </span>
                                <span>
                                  ⏰ {new Date(appointment.start_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} - {new Date(appointment.end_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                appointment.status === 'confirmed'
                                  ? isUpcoming 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-700'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status === 'confirmed' 
                                  ? isUpcoming ? 'Upcoming' : 'Completed'
                                  : 'Cancelled'
                                }
                              </span>
                              {isUpcoming && (
                                <span className="text-xs text-blue-600 font-medium">
                                  {Math.ceil((new Date(appointment.start_time).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
              
              {appointments.length > 10 && (
                <div className="text-center mt-4 pt-4 border-t">
                  <Link
                    href="/appointments"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View all {appointments.length} appointments →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 'use client'
// import { useSession } from 'next-auth/react'
// import { useState, useEffect } from 'react'
// import { AuthButton } from '../components/AuthButton'
// import Link from 'next/link'

// export default function SellerDashboard() {
//   const { data: session, status } = useSession()
//   const [appointments, setAppointments] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [roleUpdateLoading, setRoleUpdateLoading] = useState(false)

//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchAppointments()
//     }
//   }, [session])

//   const fetchAppointments = async () => {
//     try {
//       const response = await fetch(`/api/appointments?userId=${session?.user?.id}`)
//       const data = await response.json()
//       setAppointments(data)
//     } catch (error) {
//       console.error('Failed to fetch appointments:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateToSeller = async () => {
//     if (!session?.user?.email) return

//     setRoleUpdateLoading(true)
//     try {
//       const response = await fetch('/api/user/role', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: session.user.email,
//           role: 'seller',
//         }),
//       })

//       if (response.ok) {
//         window.location.reload() // Refresh to update session
//       }
//     } catch (error) {
//       console.error('Failed to update role:', error)
//     } finally {
//       setRoleUpdateLoading(false)
//     }
//   }

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg">Loading...</div>
//       </div>
//     )
//   }

//   if (!session) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-4 py-16">
//           <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
//             <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
//             <p className="text-gray-600 mb-6">Please sign in to access your seller dashboard</p>
//             <AuthButton />
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <Link href="/" className="text-xl font-bold text-blue-600">
//                 Calendar Scheduler
//               </Link>
//               <span className="text-gray-400">|</span>
//               <h1 className="text-xl font-semibold">Seller Dashboard</h1>
//             </div>
//             <AuthButton />
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         {/* Role Check */}
//         {session.user?.role !== 'seller' && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
//             <h2 className="text-lg font-semibold text-yellow-800 mb-2">
//               Switch to Seller Mode
//             </h2>
//             <p className="text-yellow-700 mb-4">
//               You're currently registered as a buyer. Switch to seller mode to share your calendar availability.
//             </p>
//             <button
//               onClick={updateToSeller}
//               disabled={roleUpdateLoading}
//               className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-yellow-300"
//             >
//               {roleUpdateLoading ? 'Updating...' : 'Become a Seller'}
//             </button>
//           </div>
//         )}

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
//               <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.name}!</h2>
//               <p className="text-gray-600 mb-4">
//                 As a seller, buyers can book appointments with you based on your calendar availability.
//               </p>
              
//               {session.user?.role === 'seller' && (
//                 <div className="flex space-x-4">
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex-1">
//                     <h3 className="font-medium text-green-800">Calendar Connected</h3>
//                     <p className="text-sm text-green-600">Your Google Calendar is integrated</p>
//                   </div>
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1">
//                     <h3 className="font-medium text-blue-800">Ready for Bookings</h3>
//                     <p className="text-sm text-blue-600">Buyers can now book with you</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Appointments */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
//               {loading ? (
//                 <div className="text-center py-8">Loading appointments...</div>
//               ) : appointments.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   No appointments yet. Share your calendar link with buyers!
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {appointments.map((appointment: any) => (
//                     <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h3 className="font-medium">{appointment.title}</h3>
//                           <p className="text-sm text-gray-600">
//                             with {appointment.buyer?.name} ({appointment.buyer?.email})
//                           </p>
//                           <p className="text-sm text-gray-500 mt-1">
//                             {new Date(appointment.start_time).toLocaleDateString()} at{' '}
//                             {new Date(appointment.start_time).toLocaleTimeString([], {
//                               hour: '2-digit',
//                               minute: '2-digit',
//                             })}
//                           </p>
//                         </div>
//                         <span className={`px-2 py-1 text-xs rounded-full ${
//                           appointment.status === 'confirmed' 
//                             ? 'bg-green-100 text-green-800' 
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {appointment.status}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
//               <div className="space-y-3">
//                 <Link
//                   href="/appointments"
//                   className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   View All Appointments
//                 </Link>
//                 <Link
//                   href="/buyer"
//                   className="block w-full bg-gray-600 text-white text-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                   Switch to Buyer View
//                 </Link>
//               </div>
//             </div>

//             {session.user?.role === 'seller' && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-lg font-semibold mb-4">Your Booking Link</h3>
//                 <p className="text-sm text-gray-600 mb-3">
//                   Share this link with potential buyers:
//                 </p>
//                 <div className="bg-gray-50 p-3 rounded border text-sm break-all">
//                   {window.location.origin}/buyer?seller={session.user.id}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }