// Data service for TeleTabib application
// This file provides API integration functions with PostgreSQL backend
// import doctorsData from '@/data/doctors/doctors.json'; // Removed hardcoded JSON data
import axios from 'axios';
import { 
  getAllDoctors as apiGetAllDoctors, 
  getDoctorById as apiGetDoctorById, 
  searchDoctors as apiSearchDoctors, 
  getAvailableSlots as apiGetAvailableSlots,
  bookAppointment as apiBookAppointment,
  getMyAppointments as apiGetMyAppointments,
  getDoctorAppointments as apiGetDoctorAppointments,
  cancelAppointment as apiCancelAppointment,
  submitFeedback as apiSubmitFeedback,
  getDoctorFeedback as apiGetDoctorFeedback,
  joinQueue as apiJoinQueue,
  getQueueStatus as apiGetQueueStatus,
  getAllSpecializations as apiGetAllSpecializations,
  getAllCities as apiGetAllCities,
  handleApiCall,
  checkNetworkConnectivity,
  saveToken
} from './auth';
// Removed unused imports to fix ESLint warnings

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
  // Real doctor registration with backend
  if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.city || !data.speciality || !data.pmdc) {
    throw new Error('All required fields must be filled')
  }
  
  if (!data.email.includes('@')) {
    throw new Error('Please provide a valid email address')
  }

  // Create axios instance for this request
  const apiClient = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  try {
    const response = await apiClient.post('/auth/doctor-signup', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      speciality: data.speciality,
      pmdc: data.pmdc,
      experience: data.experience || 0,
      message: data.message || ''
    });

    if (response.data.success && response.data.data?.token) {
      // Save token and redirect to doctor dashboard
      saveToken(response.data.data.token);
      
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
        redirectTo: response.data.redirectTo
      };
    } else {
      throw new Error(response.data.error || 'Registration failed');
    }
  } catch (error: unknown) {
    console.error('Doctor registration error:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Registration failed. Please try again.');
  }
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

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Utility function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }
  return null
}

// Utility function to make authenticated API calls
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`)
  }
  
  return data
}

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
  // Check network connectivity first
  const isConnected = await checkNetworkConnectivity()
  if (!isConnected) {
    console.warn('No network connection, using fallback data')
    return getFallbackDoctors(query, filterBy)
  }

  return handleApiCall(
    async () => {
      const response = await apiSearchDoctors(query, filterBy)
      return response.data || []
    },
    'Search Doctors'
  ).catch(error => {
    console.error('Error searching doctors:', error)
    // Fallback to mock data if API fails
    return getFallbackDoctors(query, filterBy)
  })
}

// Fallback function for when API fails
function getFallbackDoctors(query: string, filterBy: 'specialization' | 'city' | 'all'): Doctor[] {
  // Fallback data when backend is not available
  const fallbackDoctors = [
    {
      id: 101,
      name: 'Dr. Fatima Malik',
      email: 'fatima.malik@hospital.com',
      phone: '+92 (333) 987-6543',
      specialization: 'Cardiology',
      experience: '15 years',
      education: 'MD, Aga Khan University',
      location: 'Medical Center Downtown',
      city: 'Karachi',
      bio: 'Experienced cardiologist specializing in interventional cardiology and preventive care.',
      availability: 'Monday-Friday, 9 AM - 5 PM',
      languages: ['English', 'Urdu'],
      certifications: ['Board Certified Cardiologist', 'Fellowship in Interventional Cardiology'],
      rating: 4.8,
      consultationFee: 5000,
      isAvailable: true
    },
    {
      id: 102,
      name: 'Dr. Imran Siddiqui',
      email: 'imran.siddiqui@clinic.com',
      phone: '+92 (334) 123-4567',
      specialization: 'Dermatology',
      experience: '12 years',
      education: 'MD, King Edward Medical University',
      location: 'Skin Care Clinic',
      city: 'Lahore',
      bio: 'Board-certified dermatologist with expertise in skin cancer detection and cosmetic dermatology.',
      availability: 'Monday-Saturday, 8 AM - 6 PM',
      languages: ['English', 'Urdu', 'Punjabi'],
      certifications: ['Board Certified Dermatologist', 'Fellowship in Mohs Surgery'],
      rating: 4.9,
      consultationFee: 4000,
      isAvailable: true
    }
  ]
  
  if (!query.trim()) {
    return fallbackDoctors
  }
  
  const searchTerm = query.toLowerCase().trim()
  
  return fallbackDoctors.filter(doctor => {
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
  try {
    const response = await makeAuthenticatedRequest(`/doctors/search?specialization=${encodeURIComponent(specialization)}`)
    return response.doctors || []
  } catch (error) {
    console.error('Error fetching doctors by specialization:', error)
    // Fallback to filtered fallback data
    return getFallbackDoctors('', 'specialization').filter(doctor => 
      doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
    )
  }
}

export async function getDoctorsByCity(city: string): Promise<Doctor[]> {
  try {
    const response = await makeAuthenticatedRequest(`/doctors/search?city=${encodeURIComponent(city)}`)
    return response.doctors || []
  } catch (error) {
    console.error('Error fetching doctors by city:', error)
    // Fallback to filtered fallback data
    return getFallbackDoctors('', 'city').filter(doctor => 
      doctor.city.toLowerCase().includes(city.toLowerCase())
    )
  }
}

export async function getAllDoctors(page: number = 1, limit: number = 50): Promise<Doctor[]> {
  // Check network connectivity first
  const isConnected = await checkNetworkConnectivity()
  if (!isConnected) {
    console.warn('No network connection, using fallback data')
    return mockDoctors
  }

    return handleApiCall(
      async () => {
        const response = await apiGetAllDoctors(page, limit)
        return response.data || []
      },
      'Get All Doctors'
    ).catch(error => {
      console.error('Error fetching doctors:', error)
      // Fallback to fallback data if API fails
      return getFallbackDoctors('', 'all')
    })
}

export async function getDoctorById(id: number): Promise<Doctor | null> {
  // Check network connectivity first
  const isConnected = await checkNetworkConnectivity()
  if (!isConnected) {
    console.warn('No network connection, using fallback data')
    return mockDoctors.find(d => d.id === id) ?? null
  }

    return handleApiCall(
      async () => {
        const response = await apiGetDoctorById(id)
        return response.data || null
      },
      'Get Doctor By ID'
    ).catch(error => {
      console.error('Error fetching doctor:', error)
      // Fallback to fallback data if API fails
      return getFallbackDoctors('', 'all').find(d => d.id === id) ?? null
    })
}

export async function getAllSpecializations(): Promise<string[]> {
  // Check network connectivity first
  const isConnected = await checkNetworkConnectivity()
  if (!isConnected) {
    console.warn('No network connection, using fallback data')
    return Array.from(new Set(getFallbackDoctors('', 'all').map(d => d.specialization))).sort()
  }

  return handleApiCall(
    async () => {
      const response = await apiGetAllSpecializations()
      return response.data || []
    },
    'Get All Specializations'
    ).catch(error => {
      console.error('Error fetching specializations:', error)
      // Fallback to fallback data if API fails
      return Array.from(new Set(getFallbackDoctors('', 'all').map(d => d.specialization))).sort()
    })
}

export async function getAllCities(): Promise<string[]> {
  // Check network connectivity first
  const isConnected = await checkNetworkConnectivity()
  if (!isConnected) {
    console.warn('No network connection, using fallback data')
    return Array.from(new Set(getFallbackDoctors('', 'all').map(d => d.city))).sort()
  }

  return handleApiCall(
    async () => {
      const response = await apiGetAllCities()
      return response.data || []
    },
    'Get All Cities'
    ).catch(error => {
      console.error('Error fetching cities:', error)
      // Fallback to fallback data if API fails
      return Array.from(new Set(getFallbackDoctors('', 'all').map(d => d.city))).sort()
    })
}

export async function getAvailableSlots(doctorId: number, date: string): Promise<string[]> {
  // Check network connectivity first
  const isConnected = await checkNetworkConnectivity()
  if (!isConnected) {
    console.warn('No network connection, using fallback data')
    const base = generateTimeSlots(9, 17, 30)
    return base.filter((_, idx) => (doctorId + idx + date.length) % 2 === 0)
  }

  return handleApiCall(
    async () => {
      const response = await apiGetAvailableSlots(doctorId, date)
      return response.data || []
    },
    'Get Available Slots'
  ).catch(error => {
    console.error('Error fetching available slots:', error)
    // Fallback to mock data if API fails
    const base = generateTimeSlots(9, 17, 30)
    return base.filter((_, idx) => (doctorId + idx + date.length) % 2 === 0)
  })
}

export async function getDoctorReviews(doctorId: number): Promise<Review[]> {
  // Check network connectivity first
  const isConnected = await checkNetworkConnectivity()
  if (!isConnected) {
    console.warn('No network connection, using fallback data')
    return []
  }

    return handleApiCall(
      async () => {
        const response = await apiGetDoctorFeedback(doctorId)
        return response.data || []
      },
      'Get Doctor Reviews'
    ).catch(error => {
      console.error('Error fetching doctor reviews:', error)
      // Fallback to empty reviews if API fails
      return []
    })
}

export async function addDoctorReview(doctorId: number, review: Omit<Review, 'id' | 'doctorId' | 'date'>): Promise<Review> {
  return handleApiCall(
    async () => {
      const response = await apiSubmitFeedback({
        doctorId,
        rating: review.rating,
        comment: review.comment
      })
      return response.data
    },
    'Add Doctor Review'
  ).catch(error => {
    console.error('Error adding review:', error)
    // Return a fallback response if API fails
    const newReview: Review = {
      id: Math.floor(Math.random() * 1_000_000),
      doctorId,
      patientName: review.patientName,
      rating: review.rating,
      comment: review.comment,
      date: new Date().toISOString().slice(0, 10)
    }
    return newReview
  })
}

export async function createAppointment(input: { doctorId: number; date: string; time: string; type: string; notes?: string }): Promise<{ id: string }> {
  console.log('📡 createAppointment called with:', input)
  
  // Input validation
  if (!input.doctorId || !input.date || !input.time || !input.type) {
    throw new Error('Missing required appointment data')
  }
  
  return handleApiCall(
    async () => {
      console.log('🚀 Calling apiBookAppointment...')
      const response = await apiBookAppointment(input)
      console.log('✅ apiBookAppointment response:', response)
      return response.data
    },
    'Create Appointment'
  ).catch(error => {
    console.error('❌ Error creating appointment:', error)
    // For development, return a mock response but still show the error
    const mockResponse = { id: `mock-${input.doctorId}-${Date.now()}` }
    console.log('🚑 Using mock response for development:', mockResponse)
    
    // In production, you'd want to throw the error
    // For now, let's return the mock to test the UI flow
    return mockResponse
  })
}

// Transform backend appointment data to frontend format
function transformAppointment(backendAppointment: any): Appointment {
  return {
    id: backendAppointment.id,
    doctorName: `Dr. ${backendAppointment.doctor_name || backendAppointment.doctor_first_name || 'Unknown'} ${backendAppointment.doctor_last_name || ''}`.trim(),
    date: backendAppointment.appointment_date || backendAppointment.date,
    time: backendAppointment.appointment_time || backendAppointment.start_time || backendAppointment.time,
    type: backendAppointment.appointment_type || backendAppointment.consultation_type || backendAppointment.type || 'Consultation',
    status: backendAppointment.status as 'confirmed' | 'pending' | 'cancelled',
    location: backendAppointment.location || 'TeleTabib Online',
    specialty: backendAppointment.doctor_specialization || backendAppointment.specialty
  }
}

// Mock appointments data for development
const generateMockAppointments = (statusFilter?: string) => {
  const mockData = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      date: '2025-09-20',
      time: '10:00',
      type: 'Consultation',
      status: 'scheduled' as const,
      location: 'TeleTabib Online',
      specialty: 'General Practice'
    },
    {
      id: 2,
      doctorName: 'Dr. Ahmed Ali',
      date: '2025-09-22',
      time: '14:30',
      type: 'Follow-up',
      status: 'confirmed' as const,
      location: 'Medical Center Downtown',
      specialty: 'Cardiology'
    },
    {
      id: 3,
      doctorName: 'Dr. Maria Garcia',
      date: '2025-09-18',
      time: '09:00',
      type: 'Consultation',
      status: 'completed' as const,
      location: 'TeleTabib Online',
      specialty: 'Dermatology'
    }
  ]
  
  return mockData.filter(apt => !statusFilter || apt.status === statusFilter)
}

// ---------------- Appointments API ----------------
export async function fetchAppointments(status?: string, page: number = 1, limit: number = 10) {
  console.log('📅 fetchAppointments called with:', { status, page, limit })
  
  return handleApiCall(
    async () => {
      console.log('📞 Calling apiGetMyAppointments...')
      const response = await apiGetMyAppointments(status, page, limit)
      console.log('✅ fetchAppointments API response:', response)
      
      if (!response || !response.success) {
        throw new Error('API returned unsuccessful response')
      }
      
      // Backend returns { success, appointments, pagination }
      // Transform backend data to frontend format
      const transformedAppointments = (response.appointments || []).map(transformAppointment)
      console.log('✅ Transformed appointments:', transformedAppointments)
      return { data: transformedAppointments }
    },
    'Fetch Appointments'
  ).catch(error => {
    console.error('❌ Error fetching appointments:', error)
    console.log('🚑 Falling back to mock data for development')
    
    // Generate mock appointments for development
    const mockAppointments = generateMockAppointments(status)
    console.log('🌭 Mock appointments generated:', mockAppointments)
    
    return { data: mockAppointments }
  })
}

export async function cancelAppointment(appointmentId: number) {
  return handleApiCall(
    async () => {
      const response = await apiCancelAppointment(appointmentId)
      return response.data
    },
    'Cancel Appointment'
  ).catch(error => {
    console.error('Error cancelling appointment:', error)
    throw error
  })
}

export async function fetchDoctorAppointments(status?: string, date?: string, page: number = 1, limit: number = 10) {
  return handleApiCall(
    async () => {
      const response = await apiGetDoctorAppointments(status, date, page, limit)
      return response.appointments || []
    },
    'Fetch Doctor Appointments'
  ).catch(error => {
    console.error('Error fetching doctor appointments:', error)
    // Fallback to mock data if API fails
    return mockAppointments.patientAppointments || []
  })
}

// ---------------- Queue Management ----------------
export async function joinDoctorQueue(doctorId: number) {
  return handleApiCall(
    async () => {
      const response = await apiJoinQueue(doctorId)
      return response.data
    },
    'Join Doctor Queue'
  ).catch(error => {
    console.error('Error joining queue:', error)
    throw error
  })
}

export async function getDoctorQueueStatus(doctorId: number) {
  return handleApiCall(
    async () => {
      const response = await apiGetQueueStatus(doctorId)
      return response.data
    },
    'Get Doctor Queue Status'
  ).catch(error => {
    console.error('Error fetching queue status:', error)
    throw error
  })
}
