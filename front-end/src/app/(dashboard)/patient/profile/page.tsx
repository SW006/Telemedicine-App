'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Heart, Ruler, Weight, AlertCircle, Pill, UserPlus, CreditCard, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchProfileData, type Profile } from '@/lib/dataService'

export default function PatientProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender:'',
    address: '',
    medicalNotes: '',
    bloodType: '',
    height: '',
    weight: '',
    allergies: [],
    chronicConditions: [],
    medications: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    insuranceProvider: '',
    insuranceNumber: '',
    lastCheckup: '',
    vaccinationStatus: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfileData()
        setProfile(data.patientProfile)
      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal details</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-600 to-teal-600">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-teal-600">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <Input
                  value={profile.name}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <Input
                  value={profile.email}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <Input
                  value={profile.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Date of Birth</label>
                <Input
                  type="date"
                  value={profile.dob}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Gender</label>
                <Input
                  type="text"
                  value={profile.gender}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Address</label>
                <Input
                  value={profile.address}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Health Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" /> Health Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Blood Type</label>
                <Input
                  value={profile.bloodType}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Height (cm)</label>
                <Input
                  value={profile.height}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Weight (kg)</label>
                <Input
                  value={profile.weight}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">Allergies (comma separated)</label>
                <Input
                  value={profile.allergies?.join(', ')}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value.split(',').map(item => item.trim()) })}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">Chronic Conditions (comma separated)</label>
                <Input
                  value={profile.chronicConditions?.join(', ')}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, chronicConditions: e.target.value.split(',').map(item => item.trim()) })}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">Current Medications (comma separated)</label>
                <Input
                  value={profile.medications?.join(', ')}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, medications: e.target.value.split(',').map(item => item.trim()) })}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">Last Checkup Date</label>
                <Input
                  type="date"
                  value={profile.lastCheckup}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, lastCheckup: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">Vaccination Status (comma separated)</label>
                <Input
                  value={profile.vaccinationStatus?.join(', ')}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, vaccinationStatus: e.target.value.split(',').map(item => item.trim()) })}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-orange-500" /> Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Contact Name</label>
                <Input
                  value={profile.emergencyContact?.name}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    emergencyContact: { 
                      ...(profile.emergencyContact ?? { name: '', relationship: '', phone: '' }), 
                      name: e.target.value 
                    } 
                  })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Relationship</label>
                <Input
                  value={profile.emergencyContact?.relationship}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    emergencyContact: { 
                      ...(profile.emergencyContact ?? { name: '', relationship: '', phone: '' }), 
                      relationship: e.target.value 
                    } 
                  })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Contact Phone</label>
                <Input
                  value={profile.emergencyContact?.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    emergencyContact: { 
                      ...(profile.emergencyContact ?? { name: '', relationship: '', phone: '' }), 
                      phone: e.target.value 
                    } 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Insurance Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-500" /> Insurance Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Insurance Provider</label>
                <Input
                  value={profile.insuranceProvider}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, insuranceProvider: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Insurance Number</label>
                <Input
                  value={profile.insuranceNumber}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, insuranceNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Medical Notes Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-green-500" /> Medical Notes
            </h2>
            <div>
              <Textarea
                rows={4}
                value={profile.medicalNotes}
                disabled={!isEditing}
                onChange={(e) => setProfile({ ...profile, medicalNotes: e.target.value })}
                placeholder="Any additional medical information or notes from your doctor"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile.name}</p>
              <p className="text-sm text-gray-600">Patient</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700"><Mail className="h-4 w-4" /> {profile.email}</div>
          <div className="flex items-center gap-2 text-sm text-gray-700"><Phone className="h-4 w-4" /> {profile.phone}</div>
          <div className="flex items-center gap-2 text-sm text-gray-700"><Calendar className="h-4 w-4" /> DOB: {profile.dob}</div>
          <div className="flex items-center gap-2 text-sm text-gray-700"><MapPin className="h-4 w-4" /> {profile.address}</div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="font-semibold text-gray-900 mb-2">Health Summary</p>
            {profile.bloodType && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Heart className="h-4 w-4 text-red-500" /> Blood Type: {profile.bloodType}
              </div>
            )}
            {profile.height && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Ruler className="h-4 w-4 text-blue-500" /> Height: {profile.height} cm
              </div>
            )}
            {profile.weight && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Weight className="h-4 w-4 text-green-500" /> Weight: {profile.weight} kg
              </div>
            )}
            {profile.allergies && profile.allergies.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" /> 
                <div>
                  <span className="font-medium">Allergies:</span> 
                  <span>{profile.allergies.join(', ')}</span>
                </div>
              </div>
            )}
            {profile.medications && profile.medications.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Pill className="h-4 w-4 text-purple-500 mt-0.5" /> 
                <div>
                  <span className="font-medium">Medications:</span> 
                  <span>{profile.medications.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          {profile.emergencyContact?.name && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="font-semibold text-gray-900 mb-2">Emergency Contact</p>
              <div className="text-sm text-gray-700">{profile.emergencyContact.name}</div>
              <div className="text-sm text-gray-700">{profile.emergencyContact.relationship}</div>
              <div className="text-sm text-gray-700">{profile.emergencyContact.phone}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


