'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Home,
  Calendar,
  User,
  Bell,
  MapIcon,
  Menu,
  X,
  Search,
  FlaskConical,
  LogOut,
  ChevronDown
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/patient', icon: Home },
  { label: 'Appointments', href: '/patient/appointments', icon: Calendar, badge: 1 },
  { label: 'Find Doctors', href: '/patient/doctors', icon: Search },
  { label: 'Labs', href: '/labs', icon: FlaskConical },
  { label: 'Profile', href: '/patient/profile', icon: User },
  { label: 'Maps', href: '/patient/map', icon: MapIcon },
]

export default function PatientNavBar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { user, getDisplayName, logout, loading } = useAuth()

  return (
    <header className={cn('sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          <Link href="/patient" className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            <span>Patient Portal</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-current')} />
                  <span>{label}</span>
                  {badge && (
                    <span className={cn(
                      'ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold rounded-full',
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                    )}>{badge}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="p-2 rounded-full hover:bg-gray-100 relative hidden md:inline-flex">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Dropdown - Desktop */}
            {!loading && user && (
              <div className="relative hidden md:block">
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 150)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{getDisplayName()}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link href="/patient/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Profile</span>
                    </Link>
                    <Link href="/emergency-logout" className="flex items-center gap-3 px-4 py-2 hover:bg-red-100 transition-colors text-red-600 font-bold border-t border-gray-200">
                      <span>🚨</span>
                      <span className="text-sm">EMERGENCY LOGOUT</span>
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {/* User Info - Mobile */}
            {!loading && user && (
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Items */}
            {navItems.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium',
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-blue-700')} />
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-bold rounded-full',
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                    )}>{badge}</span>
                  )}
                </Link>
              )
            })}
            
            {/* Logout Buttons - Mobile */}
            {!loading && user && (
              <div className="space-y-2 mt-3">
                <Link
                  href="/emergency-logout"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold bg-red-600 text-white hover:bg-red-700"
                >
                  <span>🚨</span>
                  <span>EMERGENCY LOGOUT</span>
                </Link>
                <button 
                  onClick={() => {
                    setOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}


