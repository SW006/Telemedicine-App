"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Stethoscope, User, Phone, Award, MessageSquare } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  speciality: string;
  pmdc: string;
  experience: string;
  message: string;
  profilePic: File | null;
  pmdcCertificate: File | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  speciality?: string;
  pmdc?: string;
  experience?: string;
  message?: string;
}

export default function DoctorSignupPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    speciality: "",
    pmdc: "",
    experience: "",
    message: "",
    profilePic: null,
    pmdcCertificate: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files && files.length > 0 ? files[0] : null;
    setFormData({ ...formData, [name]: file } as unknown as FormData);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.speciality.trim()) newErrors.speciality = "Speciality is required";
    if (!formData.pmdc.trim()) newErrors.pmdc = "PMDC number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { submitDoctorApplication } = await import('@/lib/dataService');
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      await submitDoctorApplication(baseUrl, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        speciality: formData.speciality,
        pmdc: formData.pmdc,
        experience: formData.experience || undefined,
        message: formData.message || undefined,
        profilePic: formData.profilePic,
        pmdcCertificate: formData.pmdcCertificate,
      });
      alert("Application submitted! Admin will review your PMDC certificate.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        speciality: "",
        pmdc: "",
        experience: "",
        message: "",
        profilePic: null,
        pmdcCertificate: null,
      });
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-green-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg shadow-md overflow-hidden">
                <Image src="/icon.png" alt="TeleTabib" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                TeleTabib
              </span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-600">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Doctor Registration</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Stethoscope className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join TeleTabib as a Doctor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with patients, grow your practice, and provide quality healthcare through our telemedicine platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                    City *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="speciality" className="text-sm font-medium text-gray-700 mb-2 block">
                    Speciality *
                  </Label>
                  <Input
                    id="speciality"
                    name="speciality"
                    type="text"
                    placeholder="e.g., Cardiology, Pediatrics"
                    value={formData.speciality}
                    onChange={handleChange}
                    className={errors.speciality ? "border-red-500" : ""}
                  />
                  {errors.speciality && (
                    <p className="text-red-500 text-sm mt-1">{errors.speciality}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pmdc" className="text-sm font-medium text-gray-700 mb-2 block">
                    PMDC Number *
                  </Label>
                  <Input
                    id="pmdc"
                    name="pmdc"
                    type="text"
                    placeholder="Enter PMDC number"
                    value={formData.pmdc}
                    onChange={handleChange}
                    className={errors.pmdc ? "border-red-500" : ""}
                  />
                  {errors.pmdc && (
                    <p className="text-red-500 text-sm mt-1">{errors.pmdc}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  name="experience"
                  type="text"
                  placeholder="e.g., 5 years"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional Information
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your practice, interests, or any specific requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="profilePic" className="text-sm font-medium text-gray-700 mb-2 block">
                    Profile Picture
                  </Label>
                  <Input
                    id="profilePic"
                    name="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div>
                  <Label htmlFor="pmdcCertificate" className="text-sm font-medium text-gray-700 mb-2 block">
                    PMDC Certificate
                  </Label>
                  <Input
                    id="pmdcCertificate"
                    name="pmdcCertificate"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </div>

          {/* Benefits Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Join TeleTabib?</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reach More Patients</h4>
                    <p className="text-gray-600">Connect with patients across Pakistan through our telemedicine platform</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Flexible Consultations</h4>
                    <p className="text-gray-600">Conduct consultations from anywhere, anytime with our mobile app</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Growth</h4>
                    <p className="text-gray-600">Access to continuing education and professional development resources</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                    <p className="text-gray-600">Round-the-clock technical support and assistance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-blue-100 mb-6">
                Join thousands of doctors already using TeleTabib to provide better healthcare services.
              </p>
              <div className="flex items-center gap-2 text-blue-100">
                <Stethoscope className="w-5 h-5" />
                <span className="font-medium">Quick registration process</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
