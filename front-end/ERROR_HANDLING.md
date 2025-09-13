# Error Handling in TeleTabib Frontend

This document outlines the comprehensive error handling system implemented in the TeleTabib frontend application.

## Overview

The error handling system provides:
- Global error boundaries to catch React errors
- Comprehensive error logging and monitoring
- User-friendly error messages
- Retry mechanisms for failed operations
- Toast notifications for real-time feedback
- Graceful degradation for network issues

## Architecture

### 1. Error Boundary Component (`/src/components/ui/ErrorBoundary.tsx`)

A React Error Boundary that catches JavaScript errors anywhere in the component tree and displays a fallback UI.

**Features:**
- Catches unhandled errors in React components
- Displays user-friendly error messages
- Provides retry and reload options
- Logs errors for debugging
- Shows error details in development mode

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

<ErrorBoundary onError={(error, errorInfo) => console.log(error)}>
  <YourComponent />
</ErrorBoundary>
```

### 2. Global Error Handler (`/src/lib/errorHandler.ts`)

Centralized error handling utilities with comprehensive error categorization and logging.

**Key Features:**
- Custom error types (Network, Validation, Authentication, etc.)
- Error severity levels (Low, Medium, High, Critical)
- Context-aware error logging
- User-friendly message generation
- Error reporting service integration

**Error Types:**
- `NETWORK_ERROR`: Connection issues
- `VALIDATION_ERROR`: Input validation failures
- `AUTHENTICATION_ERROR`: Auth-related errors
- `AUTHORIZATION_ERROR`: Permission issues
- `NOT_FOUND_ERROR`: Resource not found
- `SERVER_ERROR`: Backend server errors
- `CLIENT_ERROR`: Frontend errors
- `UNKNOWN_ERROR`: Unclassified errors

### 3. Error Handling Hooks (`/src/lib/hooks/useErrorHandler.ts`)

React hooks for easy error handling in components.

**Available Hooks:**
- `useErrorHandler`: General error handling
- `useFormErrorHandler`: Form-specific error handling
- `useApiErrorHandler`: API call error handling

**Usage:**
```tsx
import { useErrorHandler } from '@/lib/hooks/useErrorHandler'

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler({
    onError: (error, userMessage) => {
      // Custom error handling
    }
  })

  const handleSubmit = async () => {
    const { data, error } = await handleAsyncError(async () => {
      return await apiCall()
    })
    
    if (error) {
      // Error is already handled and logged
    }
  }
}
```

### 4. Async Error Handler (`/src/lib/asyncErrorHandler.ts`)

Advanced error handling for async operations with retries, timeouts, and circuit breakers.

**Features:**
- Retry mechanisms with exponential backoff
- Timeout handling
- Circuit breaker pattern
- Batch and race operations
- Debounced and throttled operations

**Usage:**
```tsx
import { withErrorHandling, retryWithBackoff } from '@/lib/asyncErrorHandler'

// Basic async error handling
const result = await withErrorHandling(
  () => apiCall(),
  {
    retries: 3,
    retryDelay: 1000,
    timeout: 30000,
    context: { action: 'fetch_data' }
  }
)

// Retry with exponential backoff
const result = await retryWithBackoff(
  () => apiCall(),
  3, // max retries
  1000 // base delay
)
```

### 5. Toast Notifications (`/src/components/ui/Toast.tsx`)

User-friendly toast notifications for real-time error feedback.

**Features:**
- Multiple toast types (success, error, warning, info)
- Auto-dismiss with configurable duration
- Action buttons
- Smooth animations
- Queue management

**Usage:**
```tsx
import { useToastHelpers } from '@/components/ui/Toast'

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo } = useToastHelpers()

  const handleError = () => {
    showError('Something went wrong!', 'Error')
  }
}
```

## Implementation Details

### Global Error Setup

The error handling system is initialized in the root layout:

```tsx
// app/layout.tsx
<ErrorBoundary onError={handleErrorBoundaryError}>
  <ToastProvider>
    {children}
  </ToastProvider>
</ErrorBoundary>
```

### Error Logging

All errors are automatically logged with:
- Error message and stack trace
- Context information (component, action, user data)
- Timestamp and user agent
- Error type and severity
- Additional metadata

### Error Reporting

In production, errors are sent to external services:
- Development: Console logging
- Production: Error reporting service integration

### User Experience

- **Loading States**: Skeleton loaders during data fetching
- **Error States**: Clear error messages with retry options
- **Toast Notifications**: Real-time feedback for user actions
- **Graceful Degradation**: Fallback content when possible
- **Retry Mechanisms**: Automatic and manual retry options

## Best Practices

### 1. Component Error Handling

```tsx
function MyComponent() {
  const { handleError } = useErrorHandler({
    context: { component: 'MyComponent' }
  })

  const handleAction = async () => {
    try {
      await riskyOperation()
    } catch (error) {
      handleError(error, { action: 'handleAction' })
    }
  }
}
```

### 2. API Error Handling

```tsx
function DataComponent() {
  const { handleApiCall } = useApiErrorHandler()

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await handleApiCall(
        () => fetchData(),
        { action: 'load_data' }
      )
      
      if (data) {
        setData(data)
      }
    }

    loadData()
  }, [])
}
```

### 3. Form Error Handling

```tsx
function FormComponent() {
  const { handleFormError } = useFormErrorHandler()

  const handleSubmit = async (data) => {
    try {
      await submitForm(data)
    } catch (error) {
      handleFormError(error, 'email')
    }
  }
}
```

### 4. Async Operations

```tsx
function AsyncComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    
    const result = await withErrorHandling(
      () => fetchData(),
      {
        retries: 2,
        retryDelay: 1000,
        context: { action: 'load_data' }
      }
    )

    if (result.success) {
      setData(result.data)
    }

    setLoading(false)
  }
}
```

## Error Recovery

### Automatic Recovery
- Network errors: Automatic retry with exponential backoff
- Temporary failures: Retry mechanisms
- Timeout errors: Automatic retry with longer timeout

### Manual Recovery
- Retry buttons on error states
- Refresh page options
- Navigate to working sections
- Clear cache and retry

### Graceful Degradation
- Show cached data when possible
- Display partial content
- Provide alternative actions
- Fallback to simpler UI

## Monitoring and Debugging

### Development Mode
- Detailed error information in console
- Error boundary shows stack traces
- Toast notifications for all errors
- Component error boundaries

### Production Mode
- Error logging to external service
- User-friendly error messages
- Error tracking and analytics
- Performance monitoring

## Testing Error Handling

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

test('error boundary catches errors', () => {
  const ThrowError = () => {
    throw new Error('Test error')
  }

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  )

  expect(screen.getByText('Something went wrong')).toBeInTheDocument()
})
```

### Integration Tests
- Test error recovery flows
- Verify retry mechanisms
- Check error logging
- Validate user experience

## Configuration

### Environment Variables
```env
NODE_ENV=production
NEXT_PUBLIC_ERROR_REPORTING_URL=https://api.example.com/errors
NEXT_PUBLIC_ERROR_SAMPLE_RATE=0.1
```

### Error Thresholds
- Retry attempts: 3
- Retry delay: 1000ms
- Timeout: 30000ms
- Circuit breaker threshold: 5 failures

## Future Enhancements

1. **Real-time Error Monitoring**: Live error dashboard
2. **User Feedback Integration**: Error reporting with user context
3. **Predictive Error Handling**: ML-based error prevention
4. **Advanced Retry Strategies**: Adaptive retry algorithms
5. **Error Analytics**: Detailed error metrics and trends

## Conclusion

The comprehensive error handling system ensures:
- **Reliability**: Graceful handling of all error scenarios
- **User Experience**: Clear feedback and recovery options
- **Developer Experience**: Easy-to-use error handling utilities
- **Monitoring**: Complete error tracking and logging
- **Maintainability**: Centralized and consistent error handling

This system provides a robust foundation for handling runtime errors in the TeleTabib frontend application.
