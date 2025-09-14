'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isLoading) {
      return
    }
    
    setIsLoading(true)
    setErrorMessage('')
    
    // Basic validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      setIsLoading(false)
      return
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }
    
    const name = fullName.trim() || username.trim()
    const emailTrimmed = email.trim()
    
    if (!name) {
      setErrorMessage('Please provide either full name or username')
      setIsLoading(false)
      return
    }
    
    try {
      const { signUpStart } = await import('@/lib/auth')
      const result = await signUpStart({
        name,
        email: emailTrimmed,
        password,
        contactNumber: contact.trim(),
      })
      console.log('Signup successful:', result)
      const emailParam = encodeURIComponent(emailTrimmed)
      router.push(`/verify-otp?email=${emailParam}`)
    } catch (error) {
      console.error('Signup error:', error)
      const message = error instanceof Error ? error.message : 'Please check details and try again.'
      
      // Handle specific registration in progress error
      if (message.includes('Registration already in progress')) {
        setErrorMessage('A registration is already in progress for this email. Please check your email for the OTP or wait for it to expire before trying again.')
      } else {
        setErrorMessage(`Registration failed: ${message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <Image
        src="/sign-up.png"
        alt="Register Illustration"
        fill
        className="object-cover"
        priority
      />

      <div className="relative flex items-center justify-end min-h-screen pr-20">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-600">Join TeleTabib and manage your healthcare with ease</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input id="contact" type="text" value={contact} onChange={e => setContact(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          </div>
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full h-11 shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

