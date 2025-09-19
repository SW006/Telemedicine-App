"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Clock, User, MapPin, Plus, Check, X } from "lucide-react";
import { fetchDoctorAppointments, cancelAppointment } from "@/lib/dataService";

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'scheduled' | 'in-progress' | 'completed';
  notes?: string;
  location?: string;
  specialty?: string;
}

export default function DoctorAppointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Routine Check-up', 'Specialist Visit'];

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDoctorAppointments(selectedStatus === 'all' ? undefined : selectedStatus);
      setAppointments(result || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = `${appointment.patient_first_name} ${appointment.patient_last_name}`;
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (appointment.specialty && appointment.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (appointment.location && appointment.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || appointment.type === selectedType;
    const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus;
    
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
      case "scheduled": 
        return "bg-green-100 text-green-800";
      case "pending": 
        return "bg-yellow-100 text-yellow-800";
      case "in-progress": 
        return "bg-blue-100 text-blue-800";
      case "completed": 
        return "bg-purple-100 text-purple-800";
      case "cancelled": 
        return "bg-red-100 text-red-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAcceptAppointment = async (appointmentId: number) => {
    try {
      // TODO: Implement accept appointment API call
      console.log('Accepting appointment:', appointmentId);
      alert('Appointment accepted successfully!');
      await loadAppointments();
    } catch (error) {
      console.error('Error accepting appointment:', error);
      alert('Failed to accept appointment.');
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await cancelAppointment(appointmentId);
      await loadAppointments();
      alert('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Appointment
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search patients, specialties, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {appointmentTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {/* Appointments List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found
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
                          <h3 className="font-semibold text-lg">
                            {appointment.patient_first_name} {appointment.patient_last_name}
                          </h3>
                          <p className="text-gray-600">{appointment.specialty || 'General Practice'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {appointment.appointment_date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.appointment_time}
                        </div>
                        {appointment.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {appointment.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:border-green-300"
                              onClick={() => handleAcceptAppointment(appointment.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                            >
                              Start
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
                        {appointment.status === 'in-progress' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:border-green-300"
                          >
                            Complete
                          </Button>
                        )}
                        {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                          <Badge variant="secondary" className="text-gray-600">
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadAppointments}
        />
      )}
    </div>
  );
}

// Create Appointment Modal Component
function CreateAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Consultation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Routine Check-up', 'Specialist Visit'];
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientEmail || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement create appointment for patient API call
      console.log('Creating appointment:', {
        patientName,
        patientEmail,
        date,
        time,
        type,
        notes
      });
      alert('Appointment created successfully!');
      onSuccess();
      onClose();
      // Reset form
      setPatientName('');
      setPatientEmail('');
      setDate('');
      setTime('');
      setType('Consultation');
      setNotes('');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Create Appointment</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Patient Name *</label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Patient Email *</label>
              <Input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="Enter patient email"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date *</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time *</label>
                <select
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
              <label className="text-sm font-medium text-gray-700">Appointment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
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
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !patientName || !patientEmail || !date || !time}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Appointment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
