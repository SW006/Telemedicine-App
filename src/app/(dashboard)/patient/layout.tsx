import PatientNavBar from '@/components/ui/PatientNavBar'

export default function PatientDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800">
      <PatientNavBar />
      <main className="max-w-7xl mx-auto w-full p-6 md:p-10">
        {children}
      </main>
    </div>
  )
}


