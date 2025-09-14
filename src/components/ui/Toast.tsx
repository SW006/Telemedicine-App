'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ErrorCodes } from '@/lib/errorHandler'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [removeToast])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Helper functions for common toast types
export function useErrorToast() {
  const { addToast } = useToast()
  
  return useCallback((error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message
    addToast({
      type: 'error',
      title: 'Error',
      message: message,
      duration: 8000, // Longer duration for errors
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    })
  }, [addToast])
}

export function useSuccessToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, title: string = 'Success') => {
    addToast({
      type: 'success',
      title,
      message,
      duration: 3000
    })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, title: string = 'Warning') => {
    addToast({
      type: 'warning',
      title,
      message,
      duration: 5000
    })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useToast()
  
  return useCallback((message: string, title: string = 'Info') => {
    addToast({
      type: 'info',
      title,
      message,
      duration: 4000
    })
  }, [addToast])
}

// Toast container component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Individual toast item component
function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }, [toast.id, onRemove])

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div
      className={`
        max-w-sm w-full border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out
        ${getToastStyles()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">
            {toast.title}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {toast.message}
          </p>
          
          {toast.action && (
            <div className="mt-2">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium underline hover:no-underline"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for handling API errors with toast notifications
export function useApiErrorHandler() {
  const errorToast = useErrorToast()
  const warningToast = useWarningToast()
  
  return useCallback((error: unknown) => {
    let errorMessage = 'An unexpected error occurred'
    
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    
    // Handle specific error types
    if (error && typeof error === 'object' && 'code' in error) {
      const errorWithCode = error as { code: string }
      if (errorWithCode.code === ErrorCodes.NETWORK_ERROR) {
        warningToast('Please check your internet connection and try again.', 'Connection Error')
      } else if (errorWithCode.code === ErrorCodes.RATE_LIMIT_ERROR) {
        warningToast('Too many requests. Please wait a moment before trying again.', 'Rate Limited')
      } else if (errorWithCode.code === ErrorCodes.AUTHENTICATION_ERROR) {
        errorToast('Please sign in again to continue.')
      } else if (errorWithCode.code === ErrorCodes.VALIDATION_ERROR) {
        errorToast(errorMessage)
      } else {
        errorToast(errorMessage)
      }
    } else {
      errorToast(errorMessage)
    }
  }, [errorToast, warningToast])
}
