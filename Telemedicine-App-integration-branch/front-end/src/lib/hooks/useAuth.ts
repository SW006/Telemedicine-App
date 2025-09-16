'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, clearToken, fetchMe, logout as authLogout, UserRole } from '@/lib/auth'

interface User {
  id: number
  email: string
  name?: string
  role?: UserRole
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  })
  
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔄 Initializing auth...')
      try {
        const token = getToken()
        console.log('🔑 Token found:', !!token)
        
        if (!token) {
          console.log('❌ No token found, setting as unauthenticated')
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false
          })
          return
        }

        console.log('📡 Fetching user profile...')
        // Fetch user profile
        const user = await fetchMe()
        console.log('👤 User data:', user)
        
        if (user) {
          console.log('✅ User authenticated:', user.email, user.role)
          setAuthState({
            user,
            loading: false,
            isAuthenticated: true
          })
        } else {
          console.log('❌ Invalid token, clearing...')
          // Token invalid, clear it
          clearToken()
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        clearToken()
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false
        })
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = (user: User, token: string) => {
    setAuthState({
      user,
      loading: false,
      isAuthenticated: true
    })
  }

  // Logout function
  const logout = async () => {
    try {
      await authLogout()
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with local logout even if API call fails
    }
    
    setAuthState({
      user: null,
      loading: false,
      isAuthenticated: false
    })
    
    // Redirect to home page
    router.push('/sign-in')
  }

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...updates }
      }))
    }
  }

  // Check if user has specific role
  const hasRole = (role: UserRole) => {
    return authState.user?.role === role
  }

  // Get display name
  const getDisplayName = () => {
    if (authState.user?.name) {
      return authState.user.name
    }
    if (authState.user?.email) {
      return authState.user.email.split('@')[0]
    }
    return 'User'
  }

  return {
    ...authState,
    login,
    logout,
    updateUser,
    hasRole,
    getDisplayName
  }
}