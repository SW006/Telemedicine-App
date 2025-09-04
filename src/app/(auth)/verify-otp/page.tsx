'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') || ''

  const maskedEmail = useMemo(() => {
    const email = emailParam.trim()
    const [name, domain] = email.split('@')
    if (!name || !domain) return email
    const visible = name.slice(0, 2)
    return `${visible}${'*'.repeat(Math.max(0, name.length - 2))}@${domain}`
  }, [emailParam])

  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(30)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setOtp(cleaned)
    setErrorMessage('')
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit code')
      return
    }
    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setInfoMessage('')
      const { verifyOtp, fetchMe, getDashboardPathByRole } = await import('@/lib/auth')
      await verifyOtp(emailParam, otp)
      const me = await fetchMe()
      const target = getDashboardPathByRole(me?.role)
      router.push(target)
    } catch {
      setErrorMessage('Invalid or expired code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return
    try {
      setErrorMessage('')
      setInfoMessage('Sending a new code...')
      const { resendOtp } = await import('@/lib/auth')
      await resendOtp(emailParam)
      setInfoMessage('A new code has been sent')
      setResendCooldown(30)
    } catch {
      setErrorMessage('Could not resend code. Please try again later.')
      setInfoMessage('')
    }
  }, [resendCooldown, emailParam])

  return (
    <div className="relative min-h-screen">
      <Image
        src="/password_and_opt.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      <div className="relative flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={handleVerify}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-gray-600">
              We sent a 6-digit code to <span className="font-semibold">{maskedEmail || 'your email'}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">One-Time Password</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => handleChange(e.target.value)}
              maxLength={6}
              required
              className="text-center tracking-widest text-lg"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">{errorMessage}</p>
          )}
          {infoMessage && (
            <p className="text-sm text-green-600">{infoMessage}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full h-11 shadow-lg disabled:opacity-60"
          >
            {isSubmitting ? 'Verifying…' : 'Verify'}
          </Button>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="font-semibold text-blue-600 disabled:text-gray-400"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
            
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
