import Link from 'next/link'
import { AuthButton } from './components/AuthButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Calendar Scheduler
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect sellers with buyers through seamless calendar integration
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">I'm a Seller</h2>
            <p className="text-gray-600 mb-6">
              Share your availability and let buyers book appointments directly
            </p>
            <Link href="/seller" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Seller Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">I'm a Buyer</h2>
            <p className="text-gray-600 mb-6">
              Browse sellers and book appointments that work for you
            </p>
            <Link href="/buyer" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Buyer Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}