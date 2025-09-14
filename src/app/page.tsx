import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import FeaturesSection from '@/components/ui/FeatureSection'
import NavBar from '@/components/ui/NavBar'
import { ArrowRight, Play, Users, Clock, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800">
      <NavBar />
      <div className="space-y-0">

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-white via-blue-50 to-indigo-100 py-24 px-6 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              <div className="space-y-4">
                
                <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Your Health,{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                    Our Priority
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Connect with qualified doctors, schedule appointments seamlessly, and manage your healthcare journey with our modern, secure platform.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/patient-signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-blue-500 px-8 py-4 text-lg font-semibold transition-all duration-300">
                    <Play className="mr-2 w-5 h-5" />
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">500+ Doctors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="text-sm text-gray-600">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-gray-600">HIPAA Compliant</span>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative w-full h-96 lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-teal-600/10 rounded-2xl"></div>
              <Image
                src="/ehealth.png"
                alt="Medical team"
                fill
                className="object-cover rounded-2xl shadow-2xl"
                priority
              />
              
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-white py-20 px-6 relative">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">About TeleTabib</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-teal-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  TeleTabib simplifies healthcare by connecting patients with doctors, clinics, and hospitals through our innovative platform. We believe in modern, accessible, and safe medical services powered by cutting-edge technology.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our platform ensures convenience, privacy, and security at every step of your healthcare journey, making quality medical care accessible to everyone, anywhere, anytime.
                </p>
                
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-2xl border border-blue-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Secure & Private</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">24/7 Availability</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Expert Doctors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />

        

        {/* Contact Section */}
        <section id="contact" className="bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900 py-20 px-6 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">Get in Touch</h2>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                Have questions? Our support team is here to help you 24/7
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-2xl mb-2">📧</div>
                <h3 className="font-semibold text-white mb-2">Email Support</h3>
                <p className="text-teal-100">support@teletabib.com</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-2xl mb-2">📞</div>
                <h3 className="font-semibold text-white mb-2">Phone Support</h3>
                <p className="text-teal-100">+1 (800) 123-4567</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
