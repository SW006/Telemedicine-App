export type UserRole = 'patient' | 'doctor' | 'admin'

interface SignInResponse {
  success: boolean
  data?: {
    token: string
    user: { id: number; email: string; name?: string; role?: UserRole }
  }
  token?: string
  user?: { id: number; email: string; name?: string; role?: UserRole }
  redirectTo?: string
  message?: string
  error?: string
}

type VerifyOtpResponse = SignInResponse

const STORAGE_KEY = 'teletabib_token'

export function getApiBaseUrl(): string {
  // Frontend now works independently - no backend required
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
}

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, token)
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export async function signIn(email: string, password: string): Promise<SignInResponse> {
  // Mock authentication - works without backend
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
  
  // Mock user authentication logic
  if (email === 'admin@test.com' && password === 'admin123') {
    const token = 'mock-admin-token-' + Date.now()
    const user = { id: 1, email, name: 'Admin User', role: 'admin' as UserRole }
    saveToken(token)
    return { success: true, token, user, redirectTo: '/(dashboard)/admin' }
  } else if (email === 'doctor@test.com' && password === 'doctor123') {
    const token = 'mock-doctor-token-' + Date.now()
    const user = { id: 2, email, name: 'Dr. Test', role: 'doctor' as UserRole }
    saveToken(token)
    return { success: true, token, user, redirectTo: '/(dashboard)/doctor' }
  } else if (email === 'patient@test.com' && password === 'patient123') {
    const token = 'mock-patient-token-' + Date.now()
    const user = { id: 3, email, name: 'Patient Test', role: 'patient' as UserRole }
    saveToken(token)
    return { success: true, token, user, redirectTo: '/(dashboard)/patient' }
  } else {
    throw new Error('Invalid credentials. Try: admin@test.com/admin123, doctor@test.com/doctor123, or patient@test.com/patient123')
  }
}

export async function signUpStart(input: { name: string; email: string; password: string; contactNumber: string }) {
  // Mock signup - works without backend
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
  
  // Mock validation
  if (!input.email || !input.password || !input.name) {
    throw new Error('All fields are required')
  }
  
  return { success: true, message: 'Signup successful! Please verify your email with OTP: 123456' }
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  // Mock OTP verification - works without backend
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
  
  if (otp === '123456') {
    const token = 'mock-verified-token-' + Date.now()
    const user = { id: 4, email, name: 'New User', role: 'patient' as UserRole }
    saveToken(token)
    return { success: true, token, user, redirectTo: '/(dashboard)/patient' }
  } else {
    throw new Error('Invalid OTP. Use: 123456')
  }
}

export async function resendOtp(email: string) {
  // Mock resend OTP - works without backend
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
  
  // Email is used for potential future logging/validation
  console.log('Resending OTP for email:', email);
  
  return { 
    success: true, 
    message: 'OTP resent successfully! Use: 123456', 
    attemptsLeft: 3, 
    expiresIn: 300 
  }
}

export async function fetchMe(): Promise<{ id: number; email: string; name?: string; role?: UserRole } | null> {
  const token = getToken()
  if (!token) return null
  
  // Mock user data based on token
  await new Promise(resolve => setTimeout(resolve, 200)) // Simulate API delay
  
  if (token.includes('admin')) {
    return { id: 1, email: 'admin@test.com', name: 'Admin User', role: 'admin' }
  } else if (token.includes('doctor')) {
    return { id: 2, email: 'doctor@test.com', name: 'Dr. Test', role: 'doctor' }
  } else if (token.includes('patient') || token.includes('verified')) {
    return { id: 3, email: 'patient@test.com', name: 'Patient Test', role: 'patient' }
  }
  
  return null
}

export function getDashboardPathByRole(role?: UserRole): string {
  switch (role) {
    case 'doctor':
      return '/(dashboard)/doctor'
    case 'admin':
      return '/(dashboard)/admin'
    case 'patient':
    default:
      return '/(dashboard)/patient'
  }
}


