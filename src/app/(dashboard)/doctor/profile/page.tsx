'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit,
  Save,
  X,
  Award,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchProfileData, type Profile } from '@/lib/dataService'

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    education: '',
    location: '',
    bio: '',
    availability: '',
    languages: [],
    certifications: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfileData()
        setProfile(data.doctorProfile)
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
    // Here you would typically save to API
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to original values
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your professional information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
                         <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
               <Edit className="h-4 w-4 mr-2" />
               Edit Profile
             </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-center">
                             <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <User className="h-12 w-12 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent" />
               </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{profile.name}</h2>
                             <p className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent font-medium mb-4">{profile.specialization}</p>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{profile.availability}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">{profile.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                {isEditing ? (
                  <Input
                    value={profile.specialization}
                    onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">{profile.specialization}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                {isEditing ? (
                  <Input
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">{profile.experience}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                {isEditing ? (
                  <Input
                    value={profile.education}
                    onChange={(e) => setProfile({...profile, education: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">{profile.education}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
            {isEditing ? (
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={4}
                className="w-full"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
            <div className="space-y-2">
              {profile.certifications?.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Award className="h-4 w-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent" />
                  <span className="text-gray-700">{cert}</span>
                </div>
              )) || <p className="text-gray-500">No certifications listed</p>}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages?.map((language, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800"
                >
                  {language}
                </span>
              )) || <p className="text-gray-500">No languages listed</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
