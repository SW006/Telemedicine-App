'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
    
    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            We encountered an unexpected error. This has been logged and our team will investigate.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-100 p-3 rounded-md">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button className="w-full" variant="default">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button
              onClick={() => window.history.back()}
              className="flex-1"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
