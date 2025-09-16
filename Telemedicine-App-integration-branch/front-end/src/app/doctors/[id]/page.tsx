'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import NavBar from '@/components/ui/NavBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, GraduationCap, Languages, MapPin, Shield, Star, User } from 'lucide-react'
import AppointmentModal from '@/components/ui/AppointmentModal'
import { Doctor, Review, createAppointment, getDoctorById, getDoctorReviews } from '@/lib/dataService'

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>()
  const doctorId = useMemo(() => Number(params.id), [params.id])
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [d, r] = await Promise.all([
          getDoctorById(doctorId),
          getDoctorReviews(doctorId)
        ])
        setDoctor(d)
        setReviews(r)
      } finally {
        setLoading(false)
      }
    })()
  }, [doctorId])

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-3">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <p className="text-gray-700">Doctor not found</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800">
      <NavBar />
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{doctor.specialization}</Badge>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-700">{doctor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {doctor.location}, {doctor.city}</span>
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> {doctor.experience} experience</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Consultation fee</p>
                <p className="text-2xl font-semibold text-gray-900">Rs. {doctor.consultationFee}</p>
                <Button className="mt-3" disabled={!doctor.isAvailable} onClick={() => setIsAppointmentModalOpen(true)}>
                  <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {doctor.education}</div>
                <div className="flex items-center gap-2"><Languages className="w-4 h-4" /> {(doctor.languages || []).join(', ')}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(doctor.clinics || []).map((c, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.address}, {c.city}</p>
                  <p className="text-sm text-gray-700 mt-1">Fee: ${c.fee}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet</p>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{r.patientName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-700">{r.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2">{r.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.date}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <AppointmentModal
          doctor={doctor}
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          onConfirm={async (data) => {
            await createAppointment({ doctorId: data.doctorId, date: data.date, time: data.time, type: data.type, notes: data.notes })
            setIsAppointmentModalOpen(false)
            alert(`Appointment scheduled with ${data.doctorName} on ${data.date} at ${data.time}`)
          }}
        />
      </div>
    </main>
  )
}


