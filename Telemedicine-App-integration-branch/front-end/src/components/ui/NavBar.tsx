'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown, User, Stethoscope, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { user, getDisplayName, logout, loading, isAuthenticated } = useAuth()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Site Name */}
          <Link href="/" className="flex items-center gap-2 group">
           <div className="w-10 h-10 rounded-xl shadow-lg overflow-hidden">
              <Image src="/icon.png" alt="App Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>

            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-teal-700 transition-all duration-300">
              TeleTabib
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Home
            </Link>
            <Link href="/doctors" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Find Doctors
            </Link>
            <Link href="/labs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Labs
            </Link>
            <Link href="/medicine-delivery" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Medicine Delivery
            </Link>
            <Link href="/complaints" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Complaints
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Contact
            </Link>
          </div>

          {/* CTA Buttons / User Info */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && isAuthenticated && user ? (
              /* User Dropdown - Desktop */
              <div className="relative">
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
                      <p className="text-xs text-blue-600 capitalize">{user.role || 'User'}</p>
                    </div>
                    <Link href={user.role === 'doctor' ? '/doctor' : '/patient'} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Dashboard</span>
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
            ) : (
              /* Sign In / Get Started for non-authenticated users */
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium">
                    Sign In
                  </Button>
                </Link>
                
                {/* Dropdown for Get Started */}
                <div className="relative">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full px-6 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                  >
                    Get Started
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link href="/doc-signup">
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">Sign Up as Doctor</div>
                            <div className="text-sm text-gray-500">Create doctor account</div>
                          </div>
                        </div>
                      </Link>
                      <Link href="/patient-signup">
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                          <User className="w-5 h-5 text-teal-600" />
                          <div>
                            <div className="font-medium text-gray-900">Sign Up as Patient</div>
                            <div className="text-sm text-gray-500">Create patient account</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/doctors" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Doctors
              </Link>
              
              <Link 
                href="/medicine-delivery" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Medicine Delivery
              </Link>
              
              <Link 
                href="/#about" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/#features" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/#contact" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                {!loading && isAuthenticated && user ? (
                  /* Mobile User Info & Logout */
                  <>
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                          {getDisplayName().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-blue-600 capitalize">{user.role || 'User'}</p>
                        </div>
                      </div>
                    </div>
                    <Link href={user.role === 'doctor' ? '/doctor' : '/patient'}>
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsMenuOpen(false)}>
                        <User className="w-4 h-4 text-gray-600" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setIsMenuOpen(false)
                        logout()
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  /* Mobile Sign In / Get Started for non-authenticated users */
                  <>
                    <Link href="/sign-in">
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                        Sign In
                      </Button>
                    </Link>
                    
                    {/* Mobile Get Started Options */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">Get Started:</div>
                      <Link href="/doc-signup">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          Sign Up as Doctor
                        </Button>
                      </Link>
                      <Link href="/patient-signup">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <User className="w-4 h-4 text-teal-600" />
                          Sign Up as Patient
                        </Button>
                      </Link>
                      <Link 
                        href="/labs" 
                        className="block text-gray-700 hover:text-blue-700 font-medium pt-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Labs
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
