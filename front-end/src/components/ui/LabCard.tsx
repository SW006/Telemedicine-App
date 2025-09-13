"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Lab = {
  id: number;
  name: string;
  logo: string;
  openTime: string;
  closeTime: string;
  branches: number;
  discount: number;
};

export default function LabCard({
  lab,
  isOpenNow,
  onSelectTests,
}: {
  lab: Lab;
  isOpenNow: boolean;
  onSelectTests: () => void;
}) {

  const handleSelectTests = () => {
    onSelectTests();
  };
  return (
    <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200">
      <div className="p-6 flex flex-col h-full">
        {/* Header with Logo and Discount Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-white shadow-md group-hover:shadow-lg transition-shadow duration-300">
            {lab.logo ? (
              <Image src={lab.logo} alt={lab.name} fill className="object-contain p-3" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/icon.png" alt={lab.name} className="h-full w-full object-contain p-3" />
            )}
          </div>
          {lab.discount > 0 && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-3 py-1 shadow-md">
              {lab.discount}% OFF
            </Badge>
          )}
        </div>

        {/* Lab Name */}
        <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {lab.name}
        </h3>

        {/* Lab Details */}
        <div className="space-y-3 mb-6 flex-1">
          {/* Operating Hours */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">{lab.openTime} - {lab.closeTime}</span>
          </div>

          {/* Branches */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span>{lab.branches} {lab.branches === 1 ? "branch" : "branches"}</span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isOpenNow ? (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium px-3 py-1">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Open Now
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-medium px-3 py-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                Closed
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleSelectTests} 
          className="w-full bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-700 hover:to-indego-700 text-white rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-105"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Select Tests
        </Button>
      </div>
    </Card>
  );
}


