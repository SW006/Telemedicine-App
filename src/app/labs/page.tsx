"use client";

import { useState } from "react";
import labsData from "@/data/labs/labsData.json";
import LabCard from "@/components/ui/LabCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import NavBar from "@/components/ui/NavBar";

export default function LabsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "discount">("name");
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);


  const isLabOpenNow = (openTime: string, closeTime: string) => {
    // Assumes 24h format with AM/PM like "05:00 AM". Simple check for now.
    const to24h = (t: string) => {
      const [time, meridian] = t.split(" ");
      const [hourRaw, minute] = time.split(":").map(Number);
      let hh = hourRaw;
      const mm = minute;
      if (meridian === "PM" && hh !== 12) hh += 12;
      if (meridian === "AM" && hh === 12) hh = 0;
      return hh * 60 + mm;
    };
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const start = to24h(openTime);
    const end = to24h(closeTime);
    if (end === start) return true; // 24/7 case
    if (end < start) {
      // crosses midnight
      return minutesNow >= start || minutesNow <= end;
    }
    return minutesNow >= start && minutesNow <= end;
  };

  const handleSelectTests = (lab: {id: number, name: string, openTime: string, closeTime: string, branches: number, discount: number}) => {
    // Store the selected lab in localStorage for the test selection page
    localStorage.setItem('selectedLab', JSON.stringify(lab));
    
    // Navigate to test selection page
    window.location.href = '/labs/select-tests';
  };

  const filteredLabs = labsData
    .filter((lab) => lab.name.toLowerCase().includes(search.toLowerCase()))
    .filter((lab) => (onlyOpenNow ? isLabOpenNow(lab.openTime, lab.closeTime) : true))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.discount - a.discount;
    });



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Book Lab Tests
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find and book lab tests from trusted diagnostic centers near you
          </p>
        </div>

        {/* Location Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📍</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Current Location</p>
                <p className="text-gray-600">Lahore, Pakistan</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              Change Location
            </Button>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search labs by name..."
                  className="pl-12 pr-4 py-3 text-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "discount")}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700"
              >
                <option value="name">Sort: Name (A-Z)</option>
                <option value="discount">Sort: Discount (High)</option>
              </select>
            </div>
            <div>
              <Button
                variant={onlyOpenNow ? "default" : "outline"}
                onClick={() => setOnlyOpenNow((v) => !v)}
                className={`w-full py-3 rounded-xl transition-all duration-200 ${
                  onlyOpenNow 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {onlyOpenNow ? "🟢 Open Now" : "🕐 All Hours"}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-600">{filteredLabs.length}</span> lab{filteredLabs.length !== 1 ? 's' : ''}
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              isOpenNow={isLabOpenNow(lab.openTime, lab.closeTime)}
              onSelectTests={() => handleSelectTests(lab)}
            />
          ))}

          {filteredLabs.length === 0 && (
            <div className="col-span-full">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">No labs found</h2>
                  <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
                  <Button 
                    onClick={() => {
                      setSearch("");
                      setOnlyOpenNow(false);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  >
                    Clear Filters
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
