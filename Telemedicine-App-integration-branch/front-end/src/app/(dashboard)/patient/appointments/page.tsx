"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Clock, User, MapPin, Plus } from "lucide-react";
import { fetchAppointments, cancelAppointment, createAppointment } from "@/lib/dataService";
import Link from "next/link";
import AppointmentModal from "@/components/ui/AppointmentModal";
import { Doctor } from "@/lib/dataService";

interface Appointment {
  id: number;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'scheduled';
  location?: string;
  specialty?: string;
}

export default function PatientAppointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  
  const appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Routine Check-up', 'Specialist Visit'];

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🖼️ PatientAppointments: Loading appointments...', { selectedStatus });
      const result = await fetchAppointments(selectedStatus === 'all' ? undefined : selectedStatus);
      console.log('🖼️ PatientAppointments: fetchAppointments result:', result);
      setAppointments(result.data || []);
      console.log('🖼️ PatientAppointments: appointments set:', result.data || []);
    } catch (err) {
      console.error('❌ PatientAppointments: Error loading appointments:', err);
      setError('Failed to load appointments. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch = a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.specialty && a.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.location && a.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || a.type === selectedType;
    const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus === 'all') {
      loadAppointments();
    } else {
      loadAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": 
      case "scheduled": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await cancelAppointment(appointmentId);
      // Refresh appointments list
      await loadAppointments();
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    // Convert appointment to doctor format for the modal
    const doctorData = {
      id: appointment.id,
      name: appointment.doctorName,
      specialization: appointment.specialty || '',
      location: appointment.location || '',
      city: '',
      rating: 0,
      consultationFee: 0,
      isAvailable: true
    } as Doctor;
    
    setRescheduleAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <Link href="/patient/doctors">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search doctors, specialties, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Types</option>
          {appointmentTypes.map((type) => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="scheduled">Scheduled</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <p className="font-medium">Unable to load appointments</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-red-600 border-red-300"
              onClick={() => window.location.href = '/auth/sign-in'}
            >
              Go to Login
            </Button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {appointments.length === 0 ? 'No appointments found' : 'No appointments match your filters'}
              </div>
              {appointments.length === 0 && (
                <Link href="/patient/doctors">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
                      <p className="text-gray-600">{appointment.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />{appointment.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />{appointment.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />{appointment.location || 'Online'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                  <div className="flex gap-2">
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed' || appointment.status === 'pending') && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRescheduleAppointment(appointment)}
                        >
                          Reschedule
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === 'cancelled' && (
                      <Badge variant="secondary" className="text-gray-600">
                        Cancelled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <AppointmentModal
          doctor={{
            id: rescheduleAppointment.id,
            name: rescheduleAppointment.doctorName,
            specialization: rescheduleAppointment.specialty || '',
            location: rescheduleAppointment.location || '',
            city: '',
            rating: 0,
            consultationFee: 0,
            isAvailable: true
          } as Doctor}
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setRescheduleAppointment(null);
          }}
          onConfirm={async (data) => {
            try {
              // Create a new appointment (reschedule by creating new and cancelling old)
              await createAppointment({ 
                doctorId: data.doctorId, 
                date: data.date, 
                time: data.time, 
                type: data.type, 
                notes: data.notes + ' (Rescheduled)'
              });
              // Cancel the old appointment
              await cancelAppointment(rescheduleAppointment.id);
              alert('Appointment rescheduled successfully!');
              setIsRescheduleModalOpen(false);
              setRescheduleAppointment(null);
              await loadAppointments();
            } catch (error) {
              console.error('Error rescheduling appointment:', error);
              alert('Failed to reschedule appointment. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}
