'use client'

import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { 
  X, 
  MapPin, 
  User,
  CheckCircle
} from 'lucide-react'
import { Doctor } from '@/lib/dataService'

interface AppointmentModalProps {
  doctor: Doctor | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (appointmentData: AppointmentData) => void
}

interface AppointmentData {
  doctorId: number
  doctorName: string
  date: string
  time: string
  type: string
  notes: string
}

export default function AppointmentModal({ 
  doctor, 
  isOpen, 
  onClose, 
  onConfirm 
}: AppointmentModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('Consultation')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !doctor) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const appointmentData: AppointmentData = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        date,
        time,
        type,
        notes
      }
      
      await onConfirm(appointmentData)
      handleClose()
    } catch (error) {
      console.error('Error scheduling appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setDate('')
    setTime('')
    setType('Consultation')
    setNotes('')
    onClose()
  }

  const appointmentTypes = [
    'Consultation',
    'Follow-up',
    'Emergency',
    'Routine Check-up',
    'Specialist Visit'
  ]

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">Schedule Appointment</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {doctor.specialization}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {doctor.location}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{doctor.location}, {doctor.city}</span>
            </div>
          </div>

          {/* Appointment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <select
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {appointmentTypes.map((appType) => (
                  <option key={appType} value={appType}>
                    {appType}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any specific concerns or symptoms..."
              />
            </div>

            {/* Consultation Fee */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-semibold text-blue-900">Rs. {doctor.consultationFee}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !date || !time}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  )
}
