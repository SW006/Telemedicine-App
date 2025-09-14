'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pharmaciesData from '@/data/medicine-delivery/pharmacies'
import NavBar from '@/components/ui/NavBar'

type Pharmacy = {
  id: string
  name: string
  address: string
  city: string
  deliveryFee: number
  etaMinutes: number
}

export default function PharmacySelectionPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setPharmacies(pharmaciesData as unknown as Pharmacy[])
    } catch {
      setError('Failed to load pharmacies')
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) return <div className="p-6">Loading pharmacies...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm text-gray-600 shadow-sm">
            <Image src="/icon.png" width={20} height={20} alt="TeleTabib" />
            Medicine Delivery
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Select a Pharmacy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose a nearby pharmacy to place your order quickly. Track your delivery in real time after checkout.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pharmacies.map(p => (
            <Card key={p.id} className="border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50/60 to-teal-50/60">
                <CardTitle className="flex justify-between items-center">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="text-sm font-normal text-gray-500">ETA ~ {p.etaMinutes}m</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">{p.address}, {p.city}</div>
                <div className="text-sm text-gray-700">Delivery fee: Rs. {p.deliveryFee}</div>
                <Link href={`/medicine-delivery/order?pharmacyId=${p.id}`}>
                  <Button className="mt-2 w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">Choose {p.name}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}


