"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Heart, 
  FileText,
  CheckCircle,
  Activity,
  Thermometer,
  LineChart
} from "lucide-react";
import patientData from "@/data/dashboard/patient-dashboard.json";

export default function PatientDashboard() {
  const [activeMetric, setActiveMetric] = useState('bp'); // 'bp', 'temp', 'heart', 'glucose'

  const stats = [
    { title: "Total Appointments", value: patientData.stats.totalAppointments.value, change: patientData.stats.totalAppointments.change, icon: Calendar, color: "text-blue-600" },
    { title: "Upcoming", value: patientData.stats.upcoming.value, change: patientData.stats.upcoming.change, icon: Clock, color: "text-green-600" },
    { title: "Completed", value: patientData.stats.completed.value, change: patientData.stats.completed.change, icon: CheckCircle, color: "text-purple-600" },
    { title: "Health Score", value: patientData.stats.healthScore.value, change: patientData.stats.healthScore.change, icon: Heart, color: "text-red-600" }
  ];

  const healthMetrics = patientData.healthMetrics;

  const upcoming = patientData.upcomingAppointments;

  const myDoctors = patientData.myDoctors;

  // Removed inline doctor search and scheduling from dashboard

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{`Welcome back, ${patientData.user?.firstName ?? 'User'}!`}</h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your health today</p>
        </div>
        <Link href="/patient/doctors">
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
            Find Doctors
          </Button>
        </Link>
      </div>

      {/* Inline doctor search removed; use the Find Doctors page via navbar/button */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Health Metrics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button 
              variant={activeMetric === 'bp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('bp')}
              className="flex items-center gap-1"
            >
              <Activity className="w-4 h-4" />
              Blood Pressure
            </Button>
            <Button 
              variant={activeMetric === 'temp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('temp')}
              className="flex items-center gap-1"
            >
              <Thermometer className="w-4 h-4" />
              Temperature
            </Button>
            <Button 
              variant={activeMetric === 'heart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('heart')}
              className="flex items-center gap-1"
            >
              <Heart className="w-4 h-4" />
              Heart Rate
            </Button>
            <Button 
              variant={activeMetric === 'glucose' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('glucose')}
              className="flex items-center gap-1"
            >
              <LineChart className="w-4 h-4" />
              Glucose
            </Button>
          </div>
          
          <div className="h-64 border rounded-lg p-4 bg-white">
            {activeMetric === 'bp' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Blood Pressure</h3>
                    <p className="text-sm text-gray-500">Last 30 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Current: 118/76 mmHg</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
                <div className="h-40 flex items-end justify-between">
                  {healthMetrics.bp.map((reading, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="relative w-8">
                        <div 
                          className="absolute bottom-0 w-4 bg-red-500 rounded-t mx-auto left-0 right-0" 
                          style={{ height: `${reading.systolic / 2}px` }}
                        ></div>
                        <div 
                          className="absolute bottom-0 w-4 bg-blue-500 rounded-t mx-auto left-0 right-0" 
                          style={{ height: `${reading.diastolic / 2}px`, opacity: 0.7 }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1">{reading.date}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs">Systolic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Diastolic</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeMetric === 'temp' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Temperature</h3>
                    <p className="text-sm text-gray-500">Last 30 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Current: 98.4°F</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
                <div className="h-40 flex items-end justify-between">
                  {healthMetrics.temp.map((reading, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="relative w-8">
                        <div 
                          className="absolute bottom-0 w-4 bg-orange-500 rounded-t mx-auto left-0 right-0" 
                          style={{ height: `${(reading.value - 97) * 40}px` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1">{reading.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeMetric === 'heart' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Heart Rate</h3>
                    <p className="text-sm text-gray-500">Last 30 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Current: 72 bpm</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
                <div className="h-40 flex items-end justify-between">
                  {healthMetrics.heart.map((reading, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="relative w-8">
                        <div 
                          className="absolute bottom-0 w-4 bg-red-400 rounded-t mx-auto left-0 right-0" 
                          style={{ height: `${reading.value / 2}px` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1">{reading.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeMetric === 'glucose' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Blood Glucose</h3>
                    <p className="text-sm text-gray-500">Last 30 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Current: 94 mg/dL</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
                <div className="h-40 flex items-end justify-between">
                  {healthMetrics.glucose.map((reading, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="relative w-8">
                        <div 
                          className="absolute bottom-0 w-4 bg-purple-500 rounded-t mx-auto left-0 right-0" 
                          style={{ height: `${reading.value / 3}px` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1">{reading.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcoming.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.doctor}</h3>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {appointment.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {appointment.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Doctors */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                My Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myDoctors.map((doctor) => (
                  <div key={doctor.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Phone className="w-3 h-3" />
                      {doctor.phone}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/patient/doctors">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
              >
                <span>Find Doctors</span>
              </Button>
            </Link>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>View Records</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Phone className="w-6 h-6" />
              <span>Contact Doctor</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Heart className="w-6 h-6" />
              <span>Health Tips</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointment modal removed since search is on dedicated page */}
    </div>
  );
}
