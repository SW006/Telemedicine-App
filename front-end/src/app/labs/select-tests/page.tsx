"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, User, Phone } from "lucide-react";
import testsData from "@/data/labs/available-tests.json";

const defaultTests = testsData.availableTests;

export default function SelectTestsPage() {
  const router = useRouter();
  const [selectedLab, setSelectedLab] = useState<{name: string, branches: number, openTime: string, closeTime: string, discount: number} | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get lab data from localStorage (passed from labs page)
    const labData = localStorage.getItem("selectedLab");
    if (labData) {
      setSelectedLab(JSON.parse(labData));
    } else {
      // If no lab data, redirect back to labs page
      router.push("/labs");
    }
  }, [router]);

  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleConfirmBooking = async () => {
    if (!name.trim() || !contact.trim() || selectedTests.length === 0) {
      alert("Please fill in all fields and select at least one test");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store booking data for payment page
    const bookingData = {
      lab: selectedLab,
      patientName: name,
      contact: contact,
      tests: selectedTests,
      bookingDate: new Date().toISOString(),
      status: "pending",
    };

    localStorage.setItem("latestBooking", JSON.stringify(bookingData));

    setIsSubmitting(false);

    // Navigate to payment page
    router.push("/labs/payment");
  };

  if (!selectedLab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Labs
          </Button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Book Lab Tests
            </h1>
            <p className="text-lg text-gray-600">
              Complete your booking for{" "}
              <span className="font-semibold text-blue-600">
                {selectedLab.name}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lab Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Lab Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedLab.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedLab.branches}{" "}
                      {selectedLab.branches === 1 ? "branch" : "branches"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2 h-2 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>
                      {selectedLab.openTime} - {selectedLab.closeTime}
                    </span>
                  </div>
                </div>

                {selectedLab.discount > 0 && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-3 py-1">
                    {selectedLab.discount}% OFF on all tests
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Patient Information
                </CardTitle>
                <p className="text-gray-600">
                  Please provide your details for the booking
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-10 pr-4 py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contact"
                      className="text-sm font-medium text-gray-700"
                    >
                      Contact Number *
                    </Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="contact"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Enter your phone number"
                        className="pl-10 pr-4 py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Select Tests * ({selectedTests.length} selected)
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose the tests you want to book
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {defaultTests.map((test) => (
                      <label
                        key={test}
                        className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedTests.includes(test)
                            ? "border-blue-300 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        {/* Actual checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedTests.includes(test)}
                          onChange={() => toggleTest(test)}
                          className="hidden"
                        />

                        {/* Custom checkbox UI */}
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedTests.includes(test)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {selectedTests.includes(test) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>

                        <span className="text-sm font-medium text-gray-800 flex-1">
                          {test}
                        </span>

                        {selectedLab.discount > 0 && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1">
                            {selectedLab.discount}% OFF
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {selectedTests.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Selected: {selectedTests.length} test
                            {selectedTests.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-gray-600">
                            Discount will be applied at checkout
                          </p>
                        </div>
                      </div>
                      {selectedLab.discount > 0 && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {selectedLab.discount}% OFF
                          </p>
                          <p className="text-xs text-gray-600">on all tests</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 py-3 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || selectedTests.length === 0}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      selectedTests.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Confirming...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Confirm Booking
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
