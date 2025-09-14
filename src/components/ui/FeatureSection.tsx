import {
  FileText,
  BadgeCheck,
  ShieldCheck,
  Handshake,
  Zap,
  Heart
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Easy Scheduling",
      description: "Book appointments with qualified doctors in seconds. Our intuitive interface makes healthcare scheduling effortless and convenient.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      icon: BadgeCheck,
      title: "Verified Practitioners",
      description: "Every doctor and clinic is thoroughly vetted to ensure professional, ethical, and certified healthcare delivery.",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50"
    },
    {
      icon: ShieldCheck,
      title: "Data Protection Guarantee",
      description: "We use enterprise-grade encryption and secure protocols to protect your health data at every level of storage and access.",
      color: "from-purple-500 to-indigo-500",
      bgColor: "from-purple-50 to-indigo-50"
    },
    {
      icon: Handshake,
      title: "$10,000 Privacy Assurance",
      description: "Your privacy is backed by our legal protection plan — we ensure trust and accountability at every step of your journey.",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50"
    },
    {
      icon: Zap,
      title: "Instant Consultations",
      description: "Get immediate access to healthcare professionals through our secure video consultation platform, available 24/7.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50"
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Receive tailored healthcare recommendations and treatment plans based on your unique medical history and preferences.",
      color: "from-pink-500 to-rose-500",
      bgColor: "from-pink-50 to-rose-50"
    }
  ]

  return (
    <section id="features" className="bg-white py-24 px-6 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            Why Choose TeleTabib?
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900">
            Healthcare Made{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Simple
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of healthcare with our comprehensive platform designed to make medical care accessible, secure, and convenient.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div 
                key={index}
                className="group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Hover effect line */}
                  <div className={`w-0 group-hover:w-full h-1 bg-gradient-to-r ${feature.color} rounded-full transition-all duration-500`}></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Healthcare Experience?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of patients who trust TeleTabib for their healthcare needs.
            </p>
            <Link href="/patient-signup">
            <button  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Your Journey Today
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
