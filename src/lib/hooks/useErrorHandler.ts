import { useCallback } from 'react'
import { logError, ErrorCodes, handleApiError } from '../errorHandler'
import { useApiErrorHandler as useToastErrorHandler } from '@/components/ui/Toast'

// Define missing types that were referenced
export interface ErrorContext {
  action?: string
  additionalData?: Record<string, unknown>
  [key: string]: unknown
}

export interface UseErrorHandlerOptions {
  onError?: (error: Error, userMessage: string) => void
  context?: ErrorContext
  showToast?: boolean
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { onError, context, showToast = true } = options
  const errorToast = useToastErrorHandler()

  const handleError = useCallback((error: unknown, customContext?: ErrorContext) => {
    const errorContext = { ...context, ...customContext }
    const userMessage = handleApiError(error)

    // Log the error
    logError({
      type: 'server',
      message: userMessage,
      code: ErrorCodes.UNKNOWN_ERROR,
      timestamp: new Date().toISOString(),
      retryable: false
    }, errorContext.action || 'Error Handler')

    // Call custom error handler
    if (onError) {
      onError(new Error(userMessage), userMessage)
    }

    // Show toast notification if enabled
    if (showToast && typeof window !== 'undefined') {
      errorToast(error)
    }

    return { error: new Error(userMessage), userMessage }
  }, [onError, context, showToast, errorToast])

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    customContext?: ErrorContext
  ): Promise<{ data?: T; error?: unknown; userMessage?: string }> => {
    try {
      const data = await asyncFn()
      return { data }
    } catch (error) {
      const { error: appError, userMessage } = handleError(error, customContext)
      return { error: appError, userMessage }
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError
  }
}

// Hook for handling form errors
export function useFormErrorHandler() {
  const { handleError } = useErrorHandler({
    context: { action: 'form_submission' }
  })

  const handleFormError = useCallback((error: unknown, field?: string) => {
    const context: ErrorContext = {
      action: 'form_submission',
      additionalData: field ? { field } : undefined
    }
    
    return handleError(error, context)
  }, [handleError])

  return { handleFormError }
}

// Hook for handling API errors
export function useApiErrorHandler() {
  const { handleError, handleAsyncError } = useErrorHandler({
    context: { action: 'api_call' }
  })

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    customContext?: ErrorContext
  ): Promise<{ data?: T; error?: unknown; userMessage?: string }> => {
    return handleAsyncError(apiCall, customContext)
  }, [handleAsyncError])

  return { handleApiCall, handleError }
}
