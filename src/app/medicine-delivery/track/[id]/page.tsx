'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/NavBar'

type Order = {
  id: string
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered'
  pharmacyName: string
  etaMinutes: number
  createdAt: string
}

export default function TrackOrderPage() {
  const params = useParams()
  const id = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchStatus = () => {
      try {
        const existingRaw = localStorage.getItem('tt_medicine_orders')
        const existing = existingRaw ? JSON.parse(existingRaw) : {}
        const o = existing[id]
        if (!o) throw new Error('Order not found')
        // time-based progression: 0-5s pending, 5-15s processing, 15-30s out_for_delivery, >30s delivered
        const createdAtMs = new Date(o.createdAt).getTime()
        const elapsed = Date.now() - createdAtMs
        let status = 'pending'
        if (elapsed > 30000) status = 'delivered'
        else if (elapsed > 15000) status = 'out_for_delivery'
        else if (elapsed > 5000) status = 'processing'
        o.status = status
        existing[id] = o
        localStorage.setItem('tt_medicine_orders', JSON.stringify(existing))
        setOrder({
          id: o.id,
          status: o.status,
          pharmacyName: o.pharmacyName,
          etaMinutes: o.etaMinutes,
          createdAt: o.createdAt
        })
        setError(null)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to fetch order'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
    const timer = setInterval(fetchStatus, 5000)
    return () => clearInterval(timer)
  }, [id])

  const statusLabel = (s: Order['status']) => {
    switch (s) {
      case 'pending': return 'Pending confirmation'
      case 'processing': return 'Preparing medicines'
      case 'out_for_delivery': return 'Out for delivery'
      case 'delivered': return 'Delivered'
    }
  }

  if (loading) return <div className="p-6">Loading order...</div>
  if (!order) return <div className="p-6 text-red-600">{error || 'Order not found'}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavBar />
      <div className="max-w-2xl mx-auto space-y-6 py-10 px-6">
      <Card className="border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
          <CardTitle className="text-gray-700">Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="text-sm text-gray-600">Pharmacy: {order.pharmacyName}</div>
          <div className="text-lg font-medium">Status: {statusLabel(order.status)}</div>
          <div className="text-sm">ETA: ~{order.etaMinutes} minutes</div>
          {order.status !== 'delivered' ? (
            <div className="text-xs text-gray-500">This page auto-refreshes every 5 seconds.</div>
          ) : (
            <div className="text-green-600">Your order has been delivered.</div>
          )}
          <div className="pt-2">
            <Link href="/medicine-delivery">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">Back to Delivery</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}


