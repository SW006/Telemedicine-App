import axios from 'axios'
import { 
  classifyError, 
  withRetry, 
  handleApiError, 
  logError, 
  handleTokenRefresh,
  DEFAULT_RETRY_CONFIG
} from './errorHandler'

export type UserRole = 'patient' | 'doctor'

interface User {
  id: number
  email: string
  name?: string
  role?: UserRole
}

export interface SignInResponse {
  success: boolean
  data?: {
    token: string
    user: User
  }
  token?: string
  user?: User
  redirectTo?: string
  message?: string
  error?: string
}

export type VerifyOtpResponse = SignInResponse

const STORAGE_KEY = 'teletabib_token'

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'
}

// Enhanced axios instance with better error handling
const apiClient = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const classifiedError = classifyError(error)
    
    // Handle token expiration
    if (classifiedError.type === 'authentication' && 'requiresReauth' in classifiedError && classifiedError.requiresReauth) {
      const refreshed = await handleTokenRefresh()
      if (refreshed) {
        // Retry the original request
        return apiClient.request(error.config)
      } else {
        // Clear token and redirect to login
        clearToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in'
        }
      }
    }
    
    logError(classifiedError, 'API Request')
    return Promise.reject(error)
  }
)

// ---------------- Token Helpers ----------------
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

// ---------------- Auth Functions ----------------
export async function signIn(email: string, password: string): Promise<SignInResponse> {
  // Input validation
  if (!email || !password) {
    throw new Error('Email and password are required')
  }
  
  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(`${getApiBaseUrl()}/auth/sign-in`, { 
        email: email.trim().toLowerCase(), 
        password 
      })
      const data = response.data

      if (data.success && data.data?.token) {
        saveToken(data.data.token)
        return {
          success: true,
          data: {
            token: data.data.token,
            user: {
              ...data.data.user,
              role: data.data.user.role || 'patient' // Default role if not specified
            }
          },
          message: data.message,
          redirectTo: data.redirectTo
        }
      } else {
        throw new Error(data.error || 'Authentication failed')
      }
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Sign In')
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2, // Fewer retries for auth operations
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function signUpStart(input: { name: string; email: string; password: string; contactNumber: string }) {
  // Input validation
  if (!input.name?.trim()) {
    throw new Error('Name is required')
  }
  
  if (!input.email?.trim()) {
    throw new Error('Email is required')
  }
  
  if (!input.email.includes('@')) {
    throw new Error('Please enter a valid email address')
  }
  
  if (!input.password) {
    throw new Error('Password is required')
  }
  
  if (input.password.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }
  
  if (!input.contactNumber?.trim()) {
    throw new Error('Contact number is required')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(`${getApiBaseUrl()}/auth/sign-up`, {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        contact_number: input.contactNumber.trim(),
        phone: input.contactNumber.trim() // Backend expects both contact_number and phone
      })
      
      // Check if the response indicates success
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.error || 'Registration failed')
      }
    } catch (error: unknown) {
      console.log('Raw error in signUpStart:', error);
      const classifiedError = classifyError(error)
      console.log('Classified error:', classifiedError);
      logError(classifiedError, 'Sign Up')
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  // Input validation
  if (!email?.trim()) {
    throw new Error('Email is required')
  }
  
  if (!otp?.trim()) {
    throw new Error('OTP is required')
  }
  
  if (!/^\d{6}$/.test(otp.trim())) {
    throw new Error('OTP must be 6 digits')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(`${getApiBaseUrl()}/auth/verify-otp`, { 
        email: email.trim().toLowerCase(), 
        otp: otp.trim() 
      })
      const data = response.data

      if (data.success && data.token) {
        saveToken(data.token)
        return {
          success: true,
          data: {
            token: data.token,
            user: {
              ...data.user,
              role: 'patient' // Default role for regular signup
            }
          },
          message: data.message,
          redirectTo: data.redirectTo || '/dashboard'
        }
      } else {
        throw new Error(data.error || 'OTP verification failed')
      }
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'OTP Verification')
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function resendOtp(email: string) {
  // Input validation
  if (!email?.trim()) {
    throw new Error('Email is required')
  }
  
  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(`${getApiBaseUrl()}/auth/resend-otp`, { 
        email: email.trim().toLowerCase() 
      })
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Resend OTP')
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function logout() {
  try {
    const token = getToken()
    if (!token) {
      clearToken() // Clear token even if not present
      return
    }

    await apiClient.post(`${getApiBaseUrl()}/auth/logout`, {})
    clearToken()
  } catch (error) {
    const classifiedError = classifyError(error)
    logError(classifiedError, 'Logout')
    
    // Always clear token on logout, even if API call fails
    clearToken()
    
    // Don't throw error for logout failures - user should still be logged out locally
    console.warn('Logout API call failed, but user has been logged out locally')
  }
}

export async function deleteAccount(password?: string) {
  const token = getToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.delete(`${getApiBaseUrl()}/auth/delete-account`, {
        data: password ? { password } : {}
      })

      clearToken()
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Delete Account')
      
      // Don't clear token if deletion failed
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 1, // Only one retry for account deletion
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

// ---------------- Password Functions ----------------
export async function forgotPassword(email: string) {
  // Input validation
  if (!email?.trim()) {
    throw new Error('Email is required')
  }
  
  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(`${getApiBaseUrl()}/auth/forgot-password`, { 
        email: email.trim().toLowerCase() 
      })
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Forgot Password')
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function resetPassword(token: string, newPassword: string) {
  // Input validation
  if (!token?.trim()) {
    throw new Error('Reset token is required')
  }
  
  if (!newPassword) {
    throw new Error('New password is required')
  }
  
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(`${getApiBaseUrl()}/auth/reset-password`, {
        token: token.trim(),
        newPassword
      })
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Reset Password')
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

// ---------------- User Profile ----------------
export async function fetchMe(): Promise<User | null> {
  const token = getToken()
  console.log('🔑 fetchMe - Token details:', { 
    hasToken: !!token, 
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...',
    fullToken: token // Remove this in production
  })
  if (!token) return null

  return withRetry(async () => {
    try {
      const response = await apiClient.get(`${getApiBaseUrl()}/users/me`)

      if (response.data.success && response.data.data) {
        // Determine user role based on database fields
        const userData = response.data.data
        let role: UserRole = 'patient' // Default role
        
        // Check if user has doctor profile (you may need to adjust this based on your database schema)
        if (userData.is_doctor || userData.doctor_id || userData.role === 'doctor' || 
            userData.email?.toLowerCase()?.includes('admin') || 
            userData.email?.toLowerCase() === 'admin@teletabib.com' ||
            userData.is_admin || userData.role === 'admin') {
          role = 'doctor'  // Route admin to doctor dashboard
          console.log('🔧 ADMIN USER DETECTED in fetchMe:', userData.email, '-> routing to doctor')
        }
        
        return {
          ...userData,
          role
        }
      }
      return null
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Fetch User Profile')
      
      // Clear token if authentication failed
      if (classifiedError.type === 'authentication') {
        clearToken()
      }
      
      return null
    }
  }, {
    maxRetries: 1,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

// ---------------- API Helper Functions ----------------

// Enhanced error handling for API calls
export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  context: string,
  retryConfig?: Partial<typeof DEFAULT_RETRY_CONFIG>
): Promise<T> {
  return withRetry(async () => {
    try {
      return await apiCall()
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, context)
      
      // Handle authentication errors
      if (classifiedError.type === 'authentication') {
        clearToken()
      }
      
      throw new Error(handleApiError(classifiedError))
    }
  }, retryConfig || DEFAULT_RETRY_CONFIG)
}

// Network connectivity check
export async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    })
    return true
  } catch {
    return false
  }
}

// Rate limiting helper
export function getRateLimitInfo(error: unknown): { retryAfter?: number; message: string } {
  const classifiedError = classifyError(error)
  
  if (classifiedError.type === 'rate_limit' && 'retryAfter' in classifiedError) {
    return {
      retryAfter: classifiedError.retryAfter,
      message: `Rate limit exceeded. Please wait ${classifiedError.retryAfter} seconds before trying again.`
    }
  }
  
  return { message: classifiedError.message }
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''))
}

// Token validation
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true
  }
}

// Auto-retry with exponential backoff for specific operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// ---------------- Appointments API ----------------
export async function bookAppointment(appointmentData: {
  doctorId: number
  date: string
  time: string
  type: string
  notes?: string
}) {
  // Input validation
  if (!appointmentData.doctorId || appointmentData.doctorId <= 0) {
    throw new Error('Valid doctor ID is required')
  }
  
  if (!appointmentData.date) {
    throw new Error('Appointment date is required')
  }
  
  if (!appointmentData.time) {
    throw new Error('Appointment time is required')
  }
  
  if (!appointmentData.type) {
    throw new Error('Appointment type is required')
  }
  
  // Validate date format
  if (isNaN(Date.parse(appointmentData.date))) {
    throw new Error('Invalid date format')
  }
  
  // Check if date is in the future
  const appointmentDate = new Date(appointmentData.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (appointmentDate < today) {
    throw new Error('Appointment date cannot be in the past')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(
        `${getApiBaseUrl()}/appointments/book`,
        appointmentData
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Book Appointment')
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function getMyAppointments(status?: string, page: number = 1, limit: number = 10) {
  // Input validation
  if (page < 1) {
    throw new Error('Page number must be greater than 0')
  }
  
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100')
  }

  return withRetry(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (status) {
        params.append('status', status)
      }
      
      const response = await apiClient.get(
        `${getApiBaseUrl()}/appointments/my-appointments?${params.toString()}`
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get My Appointments')
      
      // Clear token if authentication failed
      if (classifiedError.type === 'authentication') {
        clearToken()
      }
      
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function getDoctorAppointments(status?: string, date?: string, page: number = 1, limit: number = 10) {
  // Input validation
  if (page < 1) {
    throw new Error('Page number must be greater than 0')
  }
  
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100')
  }

  return withRetry(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (status) {
        params.append('status', status)
      }
      
      if (date) {
        params.append('date', date)
      }
      
      const response = await apiClient.get(
        `${getApiBaseUrl()}/appointments/doctor-appointments?${params.toString()}`
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get Doctor Appointments')
      
      // Clear token if authentication failed
      if (classifiedError.type === 'authentication') {
        clearToken()
      }
      
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function cancelAppointment(appointmentId: number) {
  // Input validation
  if (!appointmentId || appointmentId <= 0) {
    throw new Error('Valid appointment ID is required')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.patch(
        `${getApiBaseUrl()}/appointments/${appointmentId}/cancel`
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Cancel Appointment')
      
      // Clear token if authentication failed
      if (classifiedError.type === 'authentication') {
        clearToken()
      }
      
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

// ---------------- Doctors API ----------------
export async function getAllDoctors(page: number = 1, limit: number = 50) {
  // Input validation
  if (page < 1) {
    throw new Error('Page number must be greater than 0')
  }
  
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100')
  }

  return withRetry(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      const response = await apiClient.get(`${getApiBaseUrl()}/doctors?${params.toString()}`)
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get All Doctors')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

export async function getDoctorById(id: number) {
  // Input validation
  if (!id || id <= 0) {
    throw new Error('Valid doctor ID is required')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.get(`${getApiBaseUrl()}/doctors/${id}`)
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get Doctor By ID')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

export async function searchDoctors(
  query: string, 
  filterBy: 'specialization' | 'city' | 'all' = 'all',
  page: number = 1, 
  limit: number = 20
) {
  // Input validation
  if (!query?.trim()) {
    throw new Error('Search query is required')
  }
  
  if (page < 1) {
    throw new Error('Page number must be greater than 0')
  }
  
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100')
  }

  return withRetry(async () => {
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        filter: filterBy,
        page: page.toString(),
        limit: limit.toString()
      })
      
      const response = await apiClient.get(`${getApiBaseUrl()}/doctors/search?${params.toString()}`)
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Search Doctors')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

// ---------------- Availability API ----------------
export async function getDoctorAvailability(doctorId: number, date?: string) {
  // Input validation
  if (!doctorId || doctorId <= 0) {
    throw new Error('Valid doctor ID is required')
  }
  
  if (date && isNaN(Date.parse(date))) {
    throw new Error('Invalid date format')
  }

  return withRetry(async () => {
    try {
      const params = new URLSearchParams()
      if (date) {
        params.append('date', date)
      }
      
      const response = await apiClient.get(
        `${getApiBaseUrl()}/availability/${doctorId}?${params.toString()}`
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get Doctor Availability')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

export async function getAvailableSlots(doctorId: number, date: string) {
  // Input validation
  if (!doctorId || doctorId <= 0) {
    throw new Error('Valid doctor ID is required')
  }
  
  if (!date) {
    throw new Error('Date is required')
  }
  
  if (isNaN(Date.parse(date))) {
    throw new Error('Invalid date format')
  }
  
  // Check if date is in the future
  const appointmentDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (appointmentDate < today) {
    throw new Error('Date cannot be in the past')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.get(`${getApiBaseUrl()}/availability/${doctorId}/slots`, {
        params: { date }
      })
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get Available Slots')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

// ---------------- Feedback API ----------------
export async function submitFeedback(feedbackData: {
  doctorId: number
  rating: number
  comment: string
}) {
  // Input validation
  if (!feedbackData.doctorId || feedbackData.doctorId <= 0) {
    throw new Error('Valid doctor ID is required')
  }
  
  if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  
  if (!feedbackData.comment?.trim()) {
    throw new Error('Comment is required')
  }
  
  if (feedbackData.comment.trim().length < 10) {
    throw new Error('Comment must be at least 10 characters long')
  }
  
  if (feedbackData.comment.trim().length > 500) {
    throw new Error('Comment must be less than 500 characters')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(
        `${getApiBaseUrl()}/feedback`,
        {
          doctorId: feedbackData.doctorId,
          rating: feedbackData.rating,
          comment: feedbackData.comment.trim()
        }
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Submit Feedback')
      
      // Clear token if authentication failed
      if (classifiedError.type === 'authentication') {
        clearToken()
      }
      
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function getDoctorFeedback(doctorId: number, page: number = 1, limit: number = 20) {
  // Input validation
  if (!doctorId || doctorId <= 0) {
    throw new Error('Valid doctor ID is required')
  }
  
  if (page < 1) {
    throw new Error('Page number must be greater than 0')
  }
  
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100')
  }

  return withRetry(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      const response = await apiClient.get(
        `${getApiBaseUrl()}/feedback/doctor/${doctorId}?${params.toString()}`
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get Doctor Feedback')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

// ---------------- Queue API ----------------
export async function joinQueue(doctorId: number) {
  // Input validation
  if (!doctorId || doctorId <= 0) {
    throw new Error('Valid doctor ID is required')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.post(
        `${getApiBaseUrl()}/queue/join`,
        { doctorId }
      )
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Join Queue')
      
      // Clear token if authentication failed
      if (classifiedError.type === 'authentication') {
        clearToken()
      }
      
      throw new Error(handleApiError(classifiedError))
    }
  }, {
    maxRetries: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  })
}

export async function getQueueStatus(doctorId: number) {
  // Input validation
  if (!doctorId || doctorId <= 0) {
    throw new Error('Valid doctor ID is required')
  }

  return withRetry(async () => {
    try {
      const response = await apiClient.get(`${getApiBaseUrl()}/queue/status/${doctorId}`)
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get Queue Status')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

// ---------------- Specializations and Cities API ----------------
export async function getAllSpecializations() {
  return withRetry(async () => {
    try {
      const response = await apiClient.get(`${getApiBaseUrl()}/doctors/specializations`)
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get All Specializations')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

export async function getAllCities() {
  return withRetry(async () => {
    try {
      const response = await apiClient.get(`${getApiBaseUrl()}/doctors/cities`)
      return response.data
    } catch (error: unknown) {
      const classifiedError = classifyError(error)
      logError(classifiedError, 'Get All Cities')
      throw new Error(handleApiError(classifiedError))
    }
  }, DEFAULT_RETRY_CONFIG)
}

// ---------------- Dashboard Redirect ----------------
export function getDashboardPathByRole(role?: UserRole): string {
  console.log('🗺️ getDashboardPathByRole called with role:', role)
  switch (role) {
    case 'doctor':
      console.log('🩺 Routing to doctor dashboard')
      return '/doctor'
    case 'patient':
      console.log('🏥 Routing to patient dashboard')
      return '/patient'
    default:
      console.log('⚠️ Unknown role, defaulting to patient dashboard')
      return '/patient'
  }
}
