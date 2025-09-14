"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/ui/NavBar";
import { ArrowLeft, User, TestTube, CheckCircle } from "lucide-react";
import testsData from "@/data/labs/available-tests.json";

const availableTests = testsData.availableTests;

export default function LabBookingForm() {
  const router = useRouter();
  const [selectedLab, setSelectedLab] = useState<{name: string, logo?: string, openTime: string, closeTime: string, branches: number, discount: number} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    selectedTests: [] as string[],
    preferredDate: "",
    preferredTime: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load selected lab and tests from localStorage
  useEffect(() => {
    const labData = localStorage.getItem('selectedLab');
    const testsData = localStorage.getItem('selectedTests');
    
    if (labData) {
      setSelectedLab(JSON.parse(labData));
    }
    
    if (testsData) {
      const selectedTests = JSON.parse(testsData);
      setFormData(prev => ({ ...prev, selectedTests }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.contact)) {
      newErrors.contact = "Please enter a valid contact number";
    }

    if (formData.selectedTests.length === 0) {
      newErrors.selectedTests = "Please select at least one test";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to localStorage (similar to existing pattern)
    const bookingId = `booking-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const booking = {
      id: bookingId,
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const existing = JSON.parse(localStorage.getItem('tt_lab_bookings') || '{}');
    existing[bookingId] = booking;
    localStorage.setItem('tt_lab_bookings', JSON.stringify(existing));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <NavBar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Your lab test booking has been submitted successfully. You will receive a confirmation call shortly.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/labs')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl"
                >
                  Book Another Test
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl"
                >
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-800 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Book Lab Tests
          </h1>
          <p className="text-lg text-gray-600">
            Fill in your details and select the tests you need
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Selected Lab Information */}
          {selectedLab && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <TestTube className="w-4 h-4 text-white" />
                  </div>
                  Selected Lab
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border-2 border-white shadow-md">
                    <Image 
                      src={selectedLab.logo || "/icon.png"} 
                      alt={selectedLab.name} 
                      width={64} 
                      height={64} 
                      className="h-full w-full object-contain p-3" 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{selectedLab.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>🕐 {selectedLab.openTime} - {selectedLab.closeTime}</span>
                      <span>📍 {selectedLab.branches} {selectedLab.branches === 1 ? "branch" : "branches"}</span>
                      {selectedLab.discount > 0 && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          {selectedLab.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Information */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`py-3 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-semibold text-gray-700">
                    Contact Number *
                  </Label>
                  <Input
                    id="contact"
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="Enter your contact number"
                    className={`py-3 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.contact ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                  />
                  {errors.contact && (
                    <p className="text-sm text-red-600">{errors.contact}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Selection */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-white" />
                </div>
                Select Lab Tests *
              </CardTitle>
              <p className="text-gray-600">
                Choose the tests you need. You can select multiple tests.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTests.map((test) => (
                  <label
                    key={test}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.selectedTests.includes(test)
                        ? 'border-blue-300 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      formData.selectedTests.includes(test)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}>
                      {formData.selectedTests.includes(test) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-800 font-medium">{test}</span>
                  </label>
                ))}
              </div>
              {errors.selectedTests && (
                <p className="text-sm text-red-600 mt-4">{errors.selectedTests}</p>
              )}
              
              {formData.selectedTests.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <TestTube className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Selected: {formData.selectedTests.length} test{formData.selectedTests.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.selectedTests.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirming Booking...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  Confirm Booking
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
