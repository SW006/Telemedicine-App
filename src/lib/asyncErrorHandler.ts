// Comprehensive async error handling utilities

import { logError, ErrorCodes, handleApiError } from './errorHandler'

// Define missing types that were referenced
export interface ErrorContext {
  additionalData?: Record<string, unknown>
  [key: string]: unknown
}

export interface AsyncOperationOptions {
  retries?: number
  retryDelay?: number
  timeout?: number
  context?: ErrorContext
  onRetry?: (attempt: number, error: Error) => void
  onSuccess?: (result: unknown) => void
  onError?: (error: Error) => void
}

export interface AsyncOperationResult<T> {
  data?: T
  error?: Error
  success: boolean
  retries: number
  duration: number
}

/**
 * Wraps an async function with comprehensive error handling, retries, and timeout
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<AsyncOperationResult<T>> {
  const {
    retries = 0,
    retryDelay = 1000,
    timeout = 30000,
    onRetry,
    onSuccess,
    onError
  } = options

  const startTime = Date.now()
  let lastError: Error | null = null
  let attempt = 0

  const executeWithTimeout = async (fn: () => Promise<T>): Promise<T> => {
    if (timeout <= 0) {
      return fn()
    }

    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`))
        }, timeout)
      })
    ])
  }

  const executeWithRetries = async (): Promise<T> => {
    for (attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await executeWithTimeout(operation)
        
        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (error) {
        lastError = error as Error

        // Log the error
        logError({
          type: 'server',
          message: lastError.message,
          code: ErrorCodes.UNKNOWN_ERROR,
          timestamp: new Date().toISOString(),
          retryable: attempt < retries
        }, `Async Operation (attempt ${attempt + 1}/${retries + 1})`)

        if (attempt === retries) {
          // Last attempt failed
          if (onError) {
            onError(lastError)
          }
          break
        }

        // Call retry callback
        if (onRetry) {
          onRetry(attempt + 1, lastError)
        }

        // Wait before retrying
        if (retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    throw lastError!
  }

  try {
    const data = await executeWithRetries()
    const duration = Date.now() - startTime

    return {
      data,
      success: true,
      retries: attempt,
      duration
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = handleApiError(error)

    return {
      error: new Error(errorMessage),
      success: false,
      retries: attempt,
      duration
    }
  }
}

/**
 * Creates a debounced version of an async function with error handling
 */
export function debounceAsync<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number,
  options: AsyncOperationOptions = {}
) {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: T): Promise<AsyncOperationResult<R>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
        const result = await withErrorHandling(() => fn(...args), options)
        resolve(result)
      }, delay)
    })
  }
}

/**
 * Creates a throttled version of an async function with error handling
 */
export function throttleAsync<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number,
  options: AsyncOperationOptions = {}
) {
  let lastCall = 0
  let lastPromise: Promise<AsyncOperationResult<R>> | null = null

  return async (...args: T): Promise<AsyncOperationResult<R>> => {
    const now = Date.now()
    
    if (now - lastCall < delay) {
      // Return the last promise if we're still in the throttle period
      return lastPromise || Promise.resolve({
        success: false,
        error: new Error('Throttled'),
        retries: 0,
        duration: 0
      })
    }

    lastCall = now
    lastPromise = withErrorHandling(() => fn(...args), options)
    
    return lastPromise
  }
}

/**
 * Batch multiple async operations with error handling
 */
export async function batchAsync<T>(
  operations: (() => Promise<T>)[],
  options: AsyncOperationOptions = {}
): Promise<AsyncOperationResult<T>[]> {
  const results = await Promise.allSettled(
    operations.map(operation => withErrorHandling(operation, options))
  )

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        error: result.reason,
        retries: 0,
        duration: 0
      }
    }
  })
}

/**
 * Race multiple async operations with error handling
 */
export async function raceAsync<T>(
  operations: (() => Promise<T>)[],
  options: AsyncOperationOptions = {}
): Promise<AsyncOperationResult<T>> {
  const results = await Promise.allSettled(
    operations.map(operation => withErrorHandling(operation, options))
  )

  // Find the first successful result
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      return result.value
    }
  }

  // If no successful result, return the first error
  const firstResult = results[0]
  if (firstResult.status === 'fulfilled') {
    return firstResult.value
  } else {
    return {
      success: false,
      error: firstResult.reason,
      retries: 0,
      duration: 0
    }
  }
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  options: Omit<AsyncOperationOptions, 'retries' | 'retryDelay'> = {}
): Promise<AsyncOperationResult<T>> {
  return withErrorHandling(operation, {
    ...options,
    retries: maxRetries,
    retryDelay: baseDelay,
    onRetry: (attempt, error) => {
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`)
      
      if (options.onRetry) {
        options.onRetry(attempt, error)
      }
    }
  })
}

/**
 * Create a circuit breaker for async operations
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<AsyncOperationResult<T>> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        return {
          success: false,
          error: new Error('Circuit breaker is OPEN'),
          retries: 0,
          duration: 0
        }
      }
    }

    const result = await withErrorHandling(operation, options)

    if (result.success) {
      this.onSuccess()
    } else {
      this.onFailure()
    }

    return result
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }

  getState() {
    return this.state
  }

  reset() {
    this.failures = 0
    this.state = 'CLOSED'
    this.lastFailureTime = 0
  }
}
