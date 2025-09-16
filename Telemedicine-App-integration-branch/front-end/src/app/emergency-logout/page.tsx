'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'

export default function EmergencyLogout() {
  const router = useRouter()

  useEffect(() => {
    // Clear the token immediately
    clearToken()
    
    // Clear ALL possible stored data
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear specific auth keys just in case
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/") 
      })
    }
    
    console.log('🚨 EMERGENCY LOGOUT - All auth data cleared')
    
    // Force redirect to login page
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging you out...</h1>
        <p className="text-gray-600 mb-4">Please wait while we clear your session.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">
          You will be redirected to the sign-in page shortly.
        </p>
      </div>
    </div>
  )
}