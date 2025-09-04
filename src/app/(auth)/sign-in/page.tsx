'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { signIn, fetchMe, getDashboardPathByRole } = await import('@/lib/auth')
      await signIn(email, password)
      const me = await fetchMe()
      const target = getDashboardPathByRole(me?.role)
      router.push(target)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Full background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/sign-in.png"
          alt="TeleTabib background"
          fill
          priority
          className="object-cover"
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-blue-900/30 to-indigo-900/40" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600">Sign in to your TeleTabib account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full h-11 shadow-lg">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-blue-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
