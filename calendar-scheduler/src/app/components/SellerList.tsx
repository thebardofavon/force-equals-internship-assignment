'use client'
import { useState, useEffect } from 'react'

interface Seller {
  id: string
  name: string
  email: string
  image?: string
}

interface SellerListProps {
  onSelectSeller: (seller: Seller) => void
}

export function SellerList({ onSelectSeller }: SellerListProps) {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellers()
  }, [])

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

  if (loading) return <div>Loading sellers...</div>

  return (
    <div className="grid gap-4">
      {sellers.map((seller) => (
        <div
          key={seller.id}
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelectSeller(seller)}
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
  )
}