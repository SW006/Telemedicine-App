'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Search, Star } from 'lucide-react'
import AppointmentModal from '@/components/ui/AppointmentModal'
import { Doctor, createAppointment, getAllDoctors, searchDoctors, getAllSpecializations, getAllCities } from '@/lib/dataService'
// Patient area already includes its own navbar via layout

function DoctorsPageContent() {
  const searchParams = useSearchParams()
  const prefilterSpecialization = searchParams.get('specialization') || ''
  const prefilterCity = searchParams.get('city') || ''

  const [query, setQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'specialization' | 'city'>(
    prefilterSpecialization ? 'specialization' : prefilterCity ? 'city' : 'all'
  )
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [allSpecializations, setAllSpecializations] = useState<string[]>([])
  const [allCities, setAllCities] = useState<string[]>([])

  const initialQuery = useMemo(() => prefilterSpecialization || prefilterCity || '', [prefilterSpecialization, prefilterCity])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (initialQuery) {
        const res = await searchDoctors(initialQuery, filterBy)
        setDoctors(res)
        setQuery(initialQuery)
      } else {
        const res = await getAllDoctors()
        setDoctors(res)
      }
    } finally {
      setLoading(false)
    }
  }, [initialQuery, filterBy])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    ;(async () => {
      const [specs, cities] = await Promise.all([getAllSpecializations(), getAllCities()])
      setAllSpecializations(specs)
      setAllCities(cities)
    })()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await searchDoctors(query, filterBy)
      setDoctors(res)
    } finally {
      setLoading(false)
    }
  }


  const applyQuickFilter = async (type: 'specialization' | 'city', value: string) => {
    setFilterBy(type)
    setQuery(value)
    setLoading(true)
    try {
      const res = await searchDoctors(value, type)
      setDoctors(res)
    } finally {
      setLoading(false)
    }
  }

  const openSchedule = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsAppointmentModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, specialization, or city"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Filter by</label>
            <select
              value={filterBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilterBy(e.target.value as 'all' | 'specialization' | 'city')
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All</option>
              <option value="specialization">Specialization</option>
              <option value="city">City</option>
            </select>
          </div>
          <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-teal-600">Search</Button>
        </div>

        {/* Quick browse sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Browse by Specialization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allSpecializations.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => applyQuickFilter('specialization', s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Browse by City</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allCities.map((c) => (
                  <button
                    key={c}
                    onClick={() => applyQuickFilter('city', c)}
                    className="p-3 text-left border rounded-lg bg-white hover:shadow-sm"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-3">Loading doctors…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        <Link href={`/doctors/${doctor.id}`}>{doctor.name}</Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{doctor.specialization}</Badge>
                        <Badge variant={doctor.isAvailable ? 'default' : 'destructive'} className="text-xs">
                          {doctor.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-700">{doctor.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-500">Rs. {doctor.consultationFee}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.location}, {doctor.city}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Button
                      type="button"
                      className="text-white bg-rose-700 hover:bg-rose-900"
                    >
                      Call
                    </Button>
                    <Button onClick={() => openSchedule(doctor)} disabled={!doctor.isAvailable} className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                      <Calendar className="w-4 h-4 mr-2" /> Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AppointmentModal
        doctor={selectedDoctor}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onConfirm={async (data) => {
          try {
            console.log('🏥 Creating appointment with data:', data)
            const result = await createAppointment({ 
              doctorId: data.doctorId, 
              date: data.date, 
              time: data.time, 
              type: data.type, 
              notes: data.notes 
            })
            console.log('✅ Appointment created successfully:', result)
            setIsAppointmentModalOpen(false)
            alert(`Appointment scheduled with ${data.doctorName} on ${data.date} at ${data.time}`)
          } catch (error) {
            console.error('❌ Failed to create appointment:', error)
            // Don't close modal on error, let the modal handle the error display
            throw error // Re-throw so the modal can handle it
          }
        }}
      />
    </main>
  )
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] grid place-items-center text-gray-600">Loading…</div>}>
      <DoctorsPageContent />
    </Suspense>
  )
}


