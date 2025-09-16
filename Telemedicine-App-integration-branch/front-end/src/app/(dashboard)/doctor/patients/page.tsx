"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, User, Phone, Mail, Calendar, X, Plus } from "lucide-react";
import patientsData from "@/data/patients/doctor-patients.json";


interface NewPatient {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  primaryCondition: string;
}

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState<NewPatient>({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'male',
    primaryCondition: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patients = patientsData.patients;

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically send data to your backend API
      console.log('Adding new patient:', newPatient);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'male',
        primaryCondition: ''
      });
      setShowAddModal(false);
      
      // Show success message (you could use a toast library here)
      alert('Patient added successfully!');
      
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: 'male',
      primaryCondition: ''
    });
    setShowAddModal(false);
  };

  const handleInputChange = (field: keyof NewPatient, value: string) => {
    setNewPatient(prev => ({ ...prev, [field]: value }));
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.primaryCondition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || patient.status === selectedStatus;
    const matchesGender = selectedGender === "all" || patient.gender === selectedGender;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "male": return "bg-blue-100 text-blue-800";
      case "female": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search patients by name, email, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <p className="text-sm text-gray-500">ID: {patient.id}</p>
                </div>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{patient.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{patient.phone}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{patient.age} years</span>
                </div>
                <Badge variant="outline" className={getGenderColor(patient.gender)}>
                  {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                </Badge>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Primary Condition:</strong> {patient.primaryCondition}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Last: {patient.lastVisit}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Next: {patient.nextAppointment}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-3">
                <Link href={`/doctor/patients/${patient.id}/record`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    View Record
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Add New Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Add New Patient</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Enter patient's full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="patient@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    placeholder="+92 300 1234567"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={newPatient.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      required
                      placeholder="25"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      value={newPatient.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Primary Condition *</Label>
                  <Input
                    id="condition"
                    type="text"
                    value={newPatient.primaryCondition}
                    onChange={(e) => handleInputChange('primaryCondition', e.target.value)}
                    required
                    placeholder="e.g., Hypertension, Diabetes, etc."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newPatient.name || !newPatient.email || !newPatient.phone || !newPatient.age || !newPatient.primaryCondition}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Patient
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      )}
    </div>
  );
}
