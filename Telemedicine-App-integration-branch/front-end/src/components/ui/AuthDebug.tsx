'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { getToken } from '@/lib/auth'

export default function AuthDebug() {
  const { user, loading, isAuthenticated, getDisplayName } = useAuth()
  const token = getToken()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">🐛 Auth Debug</h4>
      <div className="space-y-1">
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>Token: {token ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user ? '✅' : '❌'}</div>
        {user && (
          <>
            <div>Email: {user.email}</div>
            <div>Name: {getDisplayName()}</div>
            <div>Role: {user.role || 'N/A'}</div>
          </>
        )}
      </div>
    </div>
  )
}