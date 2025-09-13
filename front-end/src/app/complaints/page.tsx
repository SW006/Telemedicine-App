"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import NavBar from "@/components/ui/NavBar"

export default function ComplaintsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Mock complaint submission - works without backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      // Mock validation
      if (!name || !email || !subject || !message) {
        throw new Error("All fields are required")
      }
      
      // Simulate successful submission
      console.log('Mock complaint submitted:', { name, email, subject, message })
      
      setSuccess("Your complaint has been submitted successfully! We'll get back to you soon.")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again."
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[url('/complaint.png')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10">
        <NavBar />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto py-10 px-4">
        <Card className="shadow-lg border border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Submit a Complaint</CardTitle>
            <p className="text-sm text-gray-600">We value your feedback. Share issues or suggestions to help us improve.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} required placeholder="Brief subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={message} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} required placeholder="Describe your issue or feedback" rows={6} />
              </div>

              {success && <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-md p-2">{success}</p>}
              {error && <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-md p-2">{error}</p>}

              <div className="pt-2">
                <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


