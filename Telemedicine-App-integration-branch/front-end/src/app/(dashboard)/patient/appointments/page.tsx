"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Clock, User, MapPin } from "lucide-react";
import { fetchAppointments } from "@/lib/dataService";

interface Appointment {
  id: number;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled';
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
      setError('Failed to load appointments');
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
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
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
          <option value="pending">Pending</option>
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
                      <MapPin className="w-4 h-4" />{appointment.location}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button variant="outline" size="sm" className="text-red-600">Cancel</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
