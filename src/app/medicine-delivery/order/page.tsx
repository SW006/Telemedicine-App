'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

export default function OrderPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const pharmacyId = sp.get('pharmacyId') || ''

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')
  const [itemsText, setItemsText] = useState('')
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!pharmacyId) {
      router.replace('/medicine-delivery')
      return
    }
    try {
      const found = (pharmaciesData as unknown as Pharmacy[]).find(p => p.id === pharmacyId) || null
      setPharmacy(found)
      if (!found) throw new Error('Pharmacy not found')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load pharmacy'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [pharmacyId, router])

  const items: string[] = useMemo(() => {
    return itemsText.split('\n').map(s => s.trim()).filter(Boolean)
  }, [itemsText])

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPrescriptionImage(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    if (!pharmacy) return
    setSubmitting(true)
    setError(null)
    try {
      const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const createdAt = new Date().toISOString()
      const newOrder = {
        id,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        contactName,
        contactPhone,
        addressLine1,
        addressLine2,
        city,
        notes,
        items,
        prescriptionImage,
        etaMinutes: pharmacy.etaMinutes,
        status: 'pending',
        createdAt
      }
      const existingRaw = localStorage.getItem('tt_medicine_orders')
      const existing = existingRaw ? JSON.parse(existingRaw) : {}
      existing[id] = newOrder
      localStorage.setItem('tt_medicine_orders', JSON.stringify(existing))
      router.push(`/medicine-delivery/track/${id}`)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to submit order'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!pharmacy) return <div className="p-6 text-red-600">{error || 'Pharmacy not found'}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" 
      style={{
        backgroundImage: "url('/order.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}>
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <Card className="border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-grey-100 border-b border-blue-100/50">
          <CardTitle className="text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Delivery Details - {pharmacy.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <Input value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="House, Street" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <Input value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Area, Landmark (optional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Prescription (image)</label>
              <input type="file" accept="image/*" onChange={onFileChange} />
              {prescriptionImage && (
                <Image src={prescriptionImage} alt="Prescription preview" width={400} height={160} className="mt-2 max-h-40 rounded border" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Or type medicines (one per line)</label>
              <Textarea value={itemsText} onChange={e => setItemsText(e.target.value)} rows={8} placeholder={`Panadol 500mg x10\nOmeprazole 20mg x14`} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Delivery fee: Rs. {pharmacy.deliveryFee} • ETA ~ {pharmacy.etaMinutes}m</div>
            <div className="flex gap-3">
              <Link href="/medicine-delivery">
                <Button variant="outline">Back</Button>
              </Link>
              <Button 
                onClick={submit} 
                disabled={submitting || !contactName || !contactPhone || !addressLine1 || !city}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}


