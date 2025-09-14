"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, User, Phone, CreditCard, Download, Home } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<{lab?: {name: string, branches: number, discount?: number}, tests?: string[], patientName?: string, contact?: string, bookingDate?: string, payment?: {transactionId: string, amount: number, cardNumber: string, status: string}} | null>(null);

  useEffect(() => {
    // Get booking data from localStorage
    const storedBooking = localStorage.getItem("latestBooking");
    const paymentSuccess = localStorage.getItem("paymentSuccess");
    
    if (storedBooking && paymentSuccess === "true") {
      setBookingData(JSON.parse(storedBooking));
      // Clear the payment success flag
      localStorage.removeItem("paymentSuccess");
    } else {
      // If no booking data or payment not successful, redirect to labs page
      router.push("/labs");
    }
  }, [router]);

  const handleDownloadReceipt = () => {
    // Create a simple receipt text
    const receipt = `
LAB TEST BOOKING RECEIPT
========================

Booking ID: ${bookingData?.payment?.transactionId || 'N/A'}
Date: ${new Date(bookingData?.bookingDate || '').toLocaleDateString()}
Time: ${new Date(bookingData?.bookingDate || '').toLocaleTimeString()}

LAB INFORMATION:
- Name: ${bookingData?.lab?.name || 'N/A'}
- Branches: ${bookingData?.lab?.branches || 'N/A'}

PATIENT INFORMATION:
- Name: ${bookingData?.patientName || 'N/A'}
- Contact: ${bookingData?.contact || 'N/A'}

SELECTED TESTS:
${bookingData?.tests?.map((test: string) => `- ${test}`).join('\n') || 'N/A'}

PAYMENT INFORMATION:
- Amount: ₹${bookingData?.payment?.amount || 'N/A'}
- Card: **** **** **** ${bookingData?.payment?.cardNumber || 'N/A'}
- Status: ${bookingData?.payment?.status || 'N/A'}
- Transaction ID: ${bookingData?.payment?.transactionId || 'N/A'}

Thank you for choosing our lab services!
    `;

    // Create and download the file
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-booking-receipt-${bookingData?.payment?.transactionId || 'receipt'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!bookingData) {
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
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your lab test booking has been confirmed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Booking Confirmation
                </CardTitle>
                <p className="text-gray-600">
                  Your booking details and next steps
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transaction Info */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">Transaction Successful</h3>
                      <p className="text-sm text-green-700">
                        Transaction ID: {bookingData.payment?.transactionId}
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      {bookingData.payment?.status?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Lab Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Lab Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏥</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {bookingData.lab?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {bookingData.lab?.branches}{" "}
                        {bookingData.lab?.branches === 1 ? "branch" : "branches"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{bookingData.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{bookingData.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{bookingData.bookingDate ? new Date(bookingData.bookingDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>**** **** **** {bookingData.payment?.cardNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Tests */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Selected Tests</h3>
                  <div className="space-y-2">
                    {bookingData.tests?.map((test: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{test}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">What&apos;s Next?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• You will receive a confirmation call within 30 minutes</li>
                    <li>• Visit the lab at your convenience during their operating hours</li>
                    <li>• Bring a valid ID and this booking confirmation</li>
                    <li>• Test results will be available within 24-48 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tests ({bookingData.tests?.length || 0}):</span>
                    <span>₹{(bookingData.tests?.length || 0) * 500}</span>
                  </div>
                  {(bookingData.lab?.discount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({bookingData.lab?.discount || 0}%):</span>
                      <span>-₹{(((bookingData.tests?.length || 0) * 500) * (bookingData.lab?.discount || 0)) / 100}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Paid:</span>
                    <span>₹{bookingData.payment?.amount}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleDownloadReceipt}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                  
                  <Button
                    onClick={() => router.push("/labs")}
                    variant="outline"
                    className="w-full py-3 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Labs
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
