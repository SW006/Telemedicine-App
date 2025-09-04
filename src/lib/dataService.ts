// Data service for TeleTabib application
// This file provides mock data and data fetching functions
import doctorsData from '@/data/doctors/doctors.json';

export interface Profile {
  id: number
  name: string
  email: string
  phone: string
  dob?: string
  gender?: string
  address?: string
  medicalNotes?: string
  primaryDoctor?: number
  specialization?: string
  experience?: string
  education?: string
  location?: string
  bio?: string
  availability?: string
  languages?: string[]
  certifications?: string[]
  // Patient-specific fields
  bloodType?: string
  height?: string
  weight?: string
  allergies?: string[]
  chronicConditions?: string[]
  medications?: string[]
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  insuranceProvider?: string
  insuranceNumber?: string
  lastCheckup?: string
  vaccinationStatus?: string[]
}

export interface Doctor {
  id: number
  name: string
  email: string
  phone: string
  specialization: string
  experience: string
  education: string
  location: string
  city: string
  bio: string
  availability: string
  languages: string[]
  certifications: string[]
  rating: number
  consultationFee: number
  avatar?: string
  isAvailable: boolean
  clinics?: Clinic[]
}

export interface DoctorApplicationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  speciality: string;
  pmdc: string;
  experience?: string;
  message?: string;
  profilePic?: File | null;
  pmdcCertificate?: File | null;
}

export async function submitDoctorApplication(baseUrl: string, data: DoctorApplicationInput) {
  // Mock doctor application submission - works without backend
  await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
  
  // Mock validation
  if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.city || !data.speciality || !data.pmdc) {
    throw new Error('All required fields must be filled')
  }
  
  // Mock email validation
  if (!data.email.includes('@')) {
    throw new Error('Please provide a valid email address')
  }
  
  // Simulate successful submission
  console.log('Mock doctor application submitted:', data)
  
  return {
    success: true,
    message: 'Application submitted successfully! We will review it within 2-3 business days.',
    applicationId: Math.floor(Math.random() * 10000)
  };
}

export interface Appointment {
  id: number
  doctorName: string
  date: string
  time: string
  type: string
  status: 'confirmed' | 'pending' | 'cancelled'
  location?: string
  specialty?: string
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  lastVisit: string
  nextAppointment: string
  status: 'active' | 'inactive' | 'pending'
  primaryCondition: string
}

export interface DashboardStats {
  id: number
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: string
  bgColor: string
  color: string
}

export interface DashboardItem {
  id: number
  title: string
  subtitle: string
  time: string
  status: string
  type: string
  avatar: string
  patientName: string
}

export interface Review {
  id: number
  doctorId: number
  patientName: string
  rating: number
  comment: string
  date: string
}

export interface Clinic {
  name: string
  address: string
  city: string
  fee: number
}

export interface RecentPatient {
  id: string
  name: string
  lastVisit: string
  nextAppointment: string
  status: string
  condition: string
}

// Mock data
const mockPatientProfile: Profile = {
  id: 1,
  name: 'Ahmed Khan',
  email: 'ahmed.khan@email.com',
  phone: '+92 (300) 123-4567',
  dob: '1985-03-15',
  address: '123 Main Street, Islamabad, Pakistan',
  medicalNotes: 'Patient has mild hypertension. Allergic to penicillin. Regular check-ups recommended.',
  primaryDoctor: 101
}

const mockDoctorProfile: Profile = {
  id: 101,
  name: 'Dr. Fatima Malik',
  email: 'fatima.malik@hospital.com',
  phone: '+92 (333) 987-6543',
  dob: '1980-07-22',
  address: '456 Medical Center Dr, Lahore, Pakistan',
  medicalNotes: 'Cardiologist with 15 years of experience. Specializes in interventional cardiology.',
  primaryDoctor: undefined,
  specialization: 'Cardiology',
  experience: '15 years',
  education: 'MD, Aga Khan University',
  location: 'Medical Center Downtown',
  bio: 'Experienced cardiologist specializing in interventional cardiology and preventive care.',
  availability: 'Monday-Friday, 9 AM - 5 PM',
  languages: ['English', 'Urdu'],
  certifications: ['Board Certified Cardiologist', 'Fellowship in Interventional Cardiology']
}

const mockAppointments = {
  patientAppointments: [
    {
      id: 1,
      doctorName: 'Dr. Fatima Malik',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Consultation',
      status: 'confirmed' as const,
      location: 'Medical Center Downtown',
      specialty: 'Cardiology'
    },
    {
      id: 2,
      doctorName: 'Dr. Imran Siddiqui',
      date: '2024-01-18',
      time: '2:30 PM',
      type: 'Follow-up',
      status: 'pending' as const,
      location: 'Skin Care Clinic',
      specialty: 'Dermatology'
    },
    {
      id: 3,
      doctorName: 'Dr. Ayesha Rahman',
      date: '2024-01-20',
      time: '9:00 AM',
      type: 'Consultation',
      status: 'confirmed' as const,
      location: 'Orthopedic Institute',
      specialty: 'Orthopedics'
    }
  ],
  appointmentTypes: ['Consultation', 'Follow-up', 'Emergency', 'Routine Check-up', 'Specialist Visit'],
  timeSlots: {
    startHour: 9,
    endHour: 17,
    interval: 30
  }
}

const mockPatients = {
  patients: [
    {
      id: "1",
      name: "Asad Ali",
      email: "asad.ali@email.com",
      phone: "+92 (301) 123-4567",
      age: 45,
      gender: "male",
      lastVisit: "2024-01-10",
      nextAppointment: "2024-01-25",
      status: "active" as const,
      primaryCondition: "Hypertension"
    },
    {
      id: "2",
      name: "Sana Riaz",
      email: "sana.riaz@email.com",
      phone: "+92 (302) 234-5678",
      age: 32,
      gender: "female",
      lastVisit: "2024-01-12",
      nextAppointment: "2024-02-01",
      status: "active" as const,
      primaryCondition: "Diabetes Type 2"
    },
    {
      id: "3",
      name: "Tariq Mahmood",
      email: "tariq.mahmood@email.com",
      phone: "+92 (303) 345-6789",
      age: 58,
      gender: "male",
      lastVisit: "2024-01-08",
      nextAppointment: "2024-01-30",
      status: "active" as const,
      primaryCondition: "Arthritis"
    }
  ]
}

const mockDashboardData = {
  doctorDashboards: {
    101: {
      stats: [
        {
          id: 1,
          title: "Total Patients",
          value: "156",
          change: "+12%",
          changeType: "increase" as const,
          icon: "Users",
          bgColor: "bg-blue-100",
          color: "text-blue-600"
        },
        {
          id: 2,
          title: "Appointments Today",
          value: "8",
          change: "+2",
          changeType: "increase" as const,
          icon: "Calendar",
          bgColor: "bg-green-100",
          color: "text-green-600"
        },
        {
          id: 3,
          title: "Pending Reports",
          value: "3",
          change: "-1",
          changeType: "decrease" as const,
          icon: "FileText",
          bgColor: "bg-yellow-100",
          color: "text-yellow-600"
        },
        {
          id: 4,
          title: "Patient Satisfaction",
          value: "4.8",
          change: "+0.2",
          changeType: "increase" as const,
          icon: "TrendingUp",
          bgColor: "bg-purple-100",
          color: "text-purple-600"
        }
      ],
      upcomingAppointments: [
        {
          id: 1,
          title: "Asad Ali",
          subtitle: "Cardiology Consultation",
          time: "10:00 AM",
          status: "confirmed",
          type: "consultation"
        },
        {
          id: 2,
          title: "Sana Riaz",
          subtitle: "Follow-up Check",
          time: "2:30 PM",
          status: "pending",
          type: "follow-up"
        },
        {
          id: 3,
          title: "Tariq Mahmood",
          subtitle: "Emergency Visit",
          time: "4:00 PM",
          status: "confirmed",
          type: "emergency"
        }
      ],
      recentPatients: [
        {
          id: "1",
          name: "Asad Ali",
          lastVisit: "2024-01-10",
          nextAppointment: "2024-01-25",
          status: "active",
          condition: "Hypertension"
        },
        {
          id: "2",
          name: "Sana Riaz",
          lastVisit: "2024-01-12",
          nextAppointment: "20202-01",
          status: "active",
          condition: "Diabetes Type 2"
        },
        {
          id: "3",
          name: "Tariq Mahmood",
          lastVisit: "2024-01-08",
          nextAppointment: "2024-01-30",
          status: "active",
          condition: "Arthritis"
        }
      ]
    }
  }
}

// Import doctor data from JSON
const mockDoctors = doctorsData.doctors

// Import reviews from JSON
interface ReviewsMap {
  [key: string]: Array<{
    id: number;
    doctorId: number;
    patientName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

const mockReviews: ReviewsMap = doctorsData.reviews;

// Data fetching functions
export async function fetchProfileData() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    patientProfile: mockPatientProfile,
    doctorProfile: mockDoctorProfile
  }
}

export async function fetchProfileById(type: 'patient' | 'doctor', id: number): Promise<Profile | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (type === 'patient') {
    return mockPatientProfile.id === id ? mockPatientProfile : null
  } else {
    return mockDoctorProfile.id === id ? mockDoctorProfile : null
  }
}

export async function fetchAppointments() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400))
  
  return mockAppointments
}

export async function fetchPatients() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400))
  
  return mockPatients
}

export async function fetchDashboardData() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return mockDashboardData
}

export function generateTimeSlots(startHour: number, endHour: number, interval: number): string[] {
  const slots: string[] = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

// Doctor search functions
export async function searchDoctors(query: string, filterBy: 'specialization' | 'city' | 'all' = 'all'): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (!query.trim()) {
    return mockDoctors
  }
  
  const searchTerm = query.toLowerCase().trim()
  
  return mockDoctors.filter(doctor => {
    switch (filterBy) {
      case 'specialization':
        return doctor.specialization.toLowerCase().includes(searchTerm)
      case 'city':
        return doctor.city.toLowerCase().includes(searchTerm)
      case 'all':
      default:
        return (
          doctor.name.toLowerCase().includes(searchTerm) ||
          doctor.specialization.toLowerCase().includes(searchTerm) ||
          doctor.city.toLowerCase().includes(searchTerm) ||
          doctor.location.toLowerCase().includes(searchTerm)
        )
    }
  })
}

export async function getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return mockDoctors.filter(doctor => 
    doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
  )
}

export async function getDoctorsByCity(city: string): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return mockDoctors.filter(doctor => 
    doctor.city.toLowerCase().includes(city.toLowerCase())
  )
}

export async function getAllDoctors(): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return mockDoctors
}

export async function getDoctorById(id: number): Promise<Doctor | null> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return mockDoctors.find(d => d.id === id) ?? null
}

export async function getAllSpecializations(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return Array.from(new Set(mockDoctors.map(d => d.specialization))).sort()
}

export async function getAllCities(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return Array.from(new Set(mockDoctors.map(d => d.city))).sort()
}

export async function getAvailableSlots(doctorId: number, date: string): Promise<string[]> {
  // For demo: return a subset of generated slots between 09:00-17:00
  await new Promise(resolve => setTimeout(resolve, 120))
  const base = generateTimeSlots(9, 17, 30)
  // Pick every other slot to simulate availability
  return base.filter((_, idx) => (doctorId + idx + date.length) % 2 === 0)
}

export async function getDoctorReviews(doctorId: number): Promise<Review[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return mockReviews[doctorId.toString()] ?? []
}

export async function addDoctorReview(doctorId: number, review: Omit<Review, 'id' | 'doctorId' | 'date'>): Promise<Review> {
  await new Promise(resolve => setTimeout(resolve, 150))
  const newReview: Review = {
    id: Math.floor(Math.random() * 1_000_000),
    doctorId,
    patientName: review.patientName,
    rating: review.rating,
    comment: review.comment,
    date: new Date().toISOString().slice(0, 10)
  }
  mockReviews[doctorId.toString()] = [...(mockReviews[doctorId.toString()] ?? []), newReview]
  return newReview
}

export async function createAppointment(input: { doctorId: number; date: string; time: string; type: string; notes?: string }): Promise<{ id: string }> {
  await new Promise(resolve => setTimeout(resolve, 250))
  // In real app, persist to backend. Here just return an id.
  return { id: `${input.doctorId}-${Date.now()}` }
}
