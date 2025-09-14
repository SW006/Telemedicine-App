'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Search,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import doctorDashboardData from '@/data/dashboard/doctor-dashboard.json'

// Data loaded from JSON file (data only, no presentation)
const data = doctorDashboardData as unknown as {
  stats: Record<string, { value: string; change: string }>
  upcomingAppointments: Array<{ id: number; avatar: string; patientName: string; time: string; status: string; type: string }>
  recentPatients: Array<{ id: number; name: string; lastVisit: string; status: string; nextAppointment: string }>
}

// Presentation config defined in code
const statConfig = [
  { key: 'totalPatients', title: 'Total Patients', icon: Users, bgColor: 'bg-blue-100', color: 'text-blue-600' },
  { key: 'appointmentsToday', title: 'Appointments Today', icon: Calendar, bgColor: 'bg-green-100', color: 'text-green-600' },
  { key: 'pendingReports', title: 'Pending Reports', icon: FileText, bgColor: 'bg-yellow-100', color: 'text-yellow-600' },
  { key: 'revenueThisWeek', title: 'Revenue This Week', icon: TrendingUp, bgColor: 'bg-purple-100', color: 'text-purple-600' }
] as const


export default function DoctorDashboard() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = statConfig
    .map(cfg => ({
      title: cfg.title,
      value: data.stats[cfg.key]?.value ?? '-',
      change: data.stats[cfg.key]?.change ?? '',
      IconComponent: cfg.icon,
      bgColor: cfg.bgColor,
      color: cfg.color
    }))
  const upcomingAppointments = data.upcomingAppointments
  const recentPatients = data.recentPatients

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Dr. Sarah Johnson</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last week</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.IconComponent className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                      {appointment.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {appointment.status === 'confirmed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                    <span className="text-xs text-gray-600 capitalize">{appointment.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Patients</h2>
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-600">Last visit: {patient.lastVisit}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'active'
                        ? 'bg-gradient-to-r from-teal-100 to-green-100 text-teal-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {patient.status}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">{patient.nextAppointment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
