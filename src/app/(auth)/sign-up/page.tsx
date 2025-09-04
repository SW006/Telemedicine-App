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
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = fullName.trim() || username.trim()
    const emailTrimmed = email.trim()
    try {
      const { signUpStart } = await import('@/lib/auth')
      await signUpStart({
        name,
        email: emailTrimmed,
        password,
        contactNumber: contact.trim(),
      })
      const emailParam = encodeURIComponent(emailTrimmed)
      router.push(`/verify-otp?email=${emailParam}`)
    } catch {
      // Surface a simple error; UI already provides context
      alert('Failed to start signup. Please check details and try again.')
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
              <Input id="confirmPassword" type="password" required />
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full h-11 shadow-lg">
            Create Account
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
