"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Lock, Check, Calendar, User, Phone } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<{lab: {name: string, branches: number, discount?: number}, tests: string[], patientName: string, contact: string, bookingDate: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    // Get booking data from localStorage
    const storedBooking = localStorage.getItem("latestBooking");
    if (storedBooking) {
      setBookingData(JSON.parse(storedBooking));
    } else {
      // If no booking data, redirect back to labs page
      router.push("/labs");
    }
  }, [router]);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const calculateTotal = () => {
    if (!bookingData) return 0;
    const basePrice = bookingData.tests.length * 500; // Assuming 500 per test
    const discount = bookingData.lab.discount || 0;
    const discountAmount = (basePrice * discount) / 100;
    return basePrice - discountAmount;
  };

  const handlePayment = async () => {
    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardName || !billingAddress || !city || !zipCode) {
      alert("Please fill in all payment details");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      alert("Please enter a valid card number");
      return;
    }

    if (cvv.length < 3) {
      alert("Please enter a valid CVV");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Update booking with payment info
    const updatedBooking = {
      ...bookingData,
      payment: {
        cardNumber: cardNumber.replace(/\s/g, "").slice(-4), // Store only last 4 digits
        amount: calculateTotal(),
        status: "completed",
        transactionId: `TXN${Date.now()}`,
        paymentDate: new Date().toISOString(),
      },
      status: "confirmed",
    };

    localStorage.setItem("latestBooking", JSON.stringify(updatedBooking));
    localStorage.setItem("paymentSuccess", "true");

    setIsProcessing(false);
    router.push("/labs/payment/success");
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
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Payment
            </h1>
            <p className="text-lg text-gray-600">
              Complete your payment for lab tests at{" "}
              <span className="font-semibold text-blue-600">
                {bookingData.lab.name}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lab Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {bookingData.lab.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bookingData.lab.branches}{" "}
                      {bookingData.lab.branches === 1 ? "branch" : "branches"}
                    </p>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{bookingData.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{bookingData.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(bookingData.bookingDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tests */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Selected Tests:</h4>
                  <div className="space-y-1">
                    {bookingData.tests.map((test: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{test}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tests ({bookingData.tests.length}):</span>
                    <span>₹{bookingData.tests.length * 500}</span>
                  </div>
                  {(bookingData.lab.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({bookingData.lab.discount ?? 0}%):</span>
                      <span>-₹{((bookingData.tests.length * 500) * (bookingData.lab.discount ?? 0)) / 100}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
                <p className="text-gray-600">
                  Enter your card details to complete the payment
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                      Card Number *
                    </Label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="pl-10 pr-4 py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">
                        Expiry Date *
                      </Label>
                      <Input
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                        CVV *
                      </Label>
                      <Input
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        maxLength={4}
                        className="py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">
                      Cardholder Name *
                    </Label>
                    <Input
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Enter cardholder name"
                      className="py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Billing Address</h3>
                  
                  <div>
                    <Label htmlFor="billingAddress" className="text-sm font-medium text-gray-700">
                      Address *
                    </Label>
                    <Input
                      id="billingAddress"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="Enter your billing address"
                      className="py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City *
                      </Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        className="py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                        ZIP Code *
                      </Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="Enter ZIP code"
                        className="py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Lock className="w-4 h-4" />
                    <span className="font-semibold">Secure Payment</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
                  </p>
                </div>

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
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Pay ₹{calculateTotal()}
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
