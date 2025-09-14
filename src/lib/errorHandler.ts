// Comprehensive error handling utilities for TeleTabib

export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  details?: unknown;
  timestamp: string;
}

export interface NetworkError extends ApiError {
  type: 'network';
  isRetryable: boolean;
}

export interface ValidationError extends ApiError {
  type: 'validation';
  field?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthenticationError extends ApiError {
  type: 'authentication';
  requiresReauth?: boolean;
}

export interface RateLimitError extends ApiError {
  type: 'rate_limit';
  retryAfter?: number;
}

export interface ServerError extends ApiError {
  type: 'server';
  retryable: boolean;
}

export type TeleTabibError = NetworkError | ValidationError | AuthenticationError | RateLimitError | ServerError;

// Error codes enum
export enum ErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// HTTP status code mappings
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

// Error classification function
export function classifyError(error: unknown): TeleTabibError {
  const timestamp = new Date().toISOString();
  
  // Debug logging
  console.log('Classifying error:', error);
  
  // Network errors (no response)
  if (error && typeof error === 'object' && 'request' in error && !('response' in error)) {
    const networkError = error as { code?: string; message?: string }
    if (networkError.code === 'ECONNABORTED' || networkError.message?.includes('timeout')) {
      return {
        type: 'network',
        message: 'Request timeout. Please check your connection and try again.',
        code: ErrorCodes.TIMEOUT_ERROR,
        timestamp,
        isRetryable: true
      };
    }
    
    return {
      type: 'network',
      message: 'Network error. Please check your internet connection.',
      code: ErrorCodes.NETWORK_ERROR,
      timestamp,
      isRetryable: true
    };
  }
  
  // HTTP errors (with response)
  if (error && typeof error === 'object' && 'response' in error) {
    const responseError = error as { response: { status: number; data: unknown } }
    const { status, data } = responseError.response;
    
    // Rate limiting
    if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
      const responseData = data as { retryAfter?: number; error?: string } | undefined;
      return {
        type: 'rate_limit',
        message: 'Too many requests. Please wait before trying again.',
        code: ErrorCodes.RATE_LIMIT_ERROR,
        status,
        retryAfter: responseData?.retryAfter || 60,
        timestamp
      };
    }
    
    // Authentication errors
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      const responseData = data as { error?: string } | undefined;
      return {
        type: 'authentication',
        message: responseData?.error || 'Authentication failed. Please sign in again.',
        code: ErrorCodes.AUTHENTICATION_ERROR,
        status,
        requiresReauth: true,
        timestamp
      };
    }
    
    // Authorization errors
    if (status === HTTP_STATUS.FORBIDDEN) {
      return {
        type: 'authentication',
        message: 'Access denied. You do not have permission to perform this action.',
        code: ErrorCodes.AUTHORIZATION_ERROR,
        status,
        requiresReauth: false,
        timestamp
      };
    }
    
    // Validation errors
    if (status === HTTP_STATUS.BAD_REQUEST || status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
      const responseData = data as { error?: string; errors?: Array<{ field: string; message: string }> } | undefined;
      console.log('Validation error response data:', responseData);
      return {
        type: 'validation',
        message: responseData?.error || 'Invalid input. Please check your data.',
        code: ErrorCodes.VALIDATION_ERROR,
        status,
        errors: responseData?.errors || [],
        timestamp
      };
    }
    
    // Not found
    if (status === HTTP_STATUS.NOT_FOUND) {
      const responseData = data as { error?: string } | undefined;
      return {
        type: 'server',
        message: responseData?.error || 'Resource not found.',
        code: ErrorCodes.NOT_FOUND_ERROR,
        status,
        retryable: false,
        timestamp
      };
    }
    
    // Conflict
    if (status === HTTP_STATUS.CONFLICT) {
      const responseData = data as { error?: string } | undefined;
      return {
        type: 'server',
        message: responseData?.error || 'Resource conflict. The requested action cannot be completed.',
        code: ErrorCodes.CONFLICT_ERROR,
        status,
        retryable: false,
        timestamp
      };
    }
    
    // Server errors
    if (status >= 500) {
      const responseData = data as { error?: string } | undefined;
      return {
        type: 'server',
        message: responseData?.error || 'Server error. Please try again later.',
        code: ErrorCodes.SERVER_ERROR,
        status,
        retryable: DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status),
        timestamp
      };
    }
    
    // Other HTTP errors
    const responseData = data as { error?: string } | undefined;
    return {
      type: 'server',
      message: responseData?.error || `Request failed with status ${status}`,
      code: ErrorCodes.SERVER_ERROR,
      status,
      retryable: false,
      timestamp
    };
  }
  
  // Unknown errors
  const errorMessage = error && typeof error === 'object' && 'message' in error 
    ? (error as { message: string }).message 
    : 'An unexpected error occurred.';
    
  return {
    type: 'server',
    message: errorMessage,
    code: ErrorCodes.UNKNOWN_ERROR,
    timestamp,
    retryable: false
  };
}

// Retry function with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const classifiedError = classifyError(error);
      
      // Don't retry on the last attempt
      if (attempt === finalConfig.maxRetries) {
        break;
      }
      
      // Don't retry if error is not retryable
      if (!shouldRetry(classifiedError)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
        finalConfig.maxDelay
      );
      
      // Special handling for rate limiting
      if (classifiedError.type === 'rate_limit' && 'retryAfter' in classifiedError) {
        await new Promise(resolve => setTimeout(resolve, classifiedError.retryAfter! * 1000));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Check if error should be retried
function shouldRetry(error: TeleTabibError): boolean {
  switch (error.type) {
    case 'network':
      return 'isRetryable' in error && error.isRetryable;
    case 'rate_limit':
      return true;
    case 'server':
      return 'retryable' in error && error.retryable;
    default:
      return false;
  }
}

// Error message formatter
export function formatErrorMessage(error: TeleTabibError): string {
  switch (error.type) {
    case 'validation':
      if (error.errors && error.errors.length > 0) {
        return error.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      }
      return error.message;
    
    case 'authentication':
      if ('requiresReauth' in error && error.requiresReauth) {
        return `${error.message} Please sign in again.`;
      }
      return error.message;
    
    case 'rate_limit':
      if ('retryAfter' in error && error.retryAfter) {
        return `${error.message} Retry after ${error.retryAfter} seconds.`;
      }
      return error.message;
    
    default:
      return error.message;
  }
}

// Error handler for user-facing messages
export function handleApiError(error: unknown): string {
  const classifiedError = classifyError(error);
  return formatErrorMessage(classifiedError);
}

// Logging utility
export function logError(error: TeleTabibError, context?: string) {
  const logData = {
    timestamp: error.timestamp,
    type: error.type,
    code: error.code,
    message: error.message,
    status: 'status' in error ? error.status : undefined,
    context
  };
  
  console.error('API Error:', JSON.stringify(logData, null, 2));
  
  // In production, you might want to send this to a logging service
  // logToService(logData);
}

// Token refresh handler
export async function handleTokenRefresh(): Promise<boolean> {
  try {
    // Implement token refresh logic here
    // This would typically involve calling a refresh endpoint
    // and updating the stored token
    
    console.log('Attempting token refresh...');
    // const response = await axios.post('/auth/refresh', { refreshToken });
    // saveToken(response.data.token);
    
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}
