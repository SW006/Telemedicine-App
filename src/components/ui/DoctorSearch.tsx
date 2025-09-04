'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Calendar,
  Filter,
  User,
  GraduationCap
} from 'lucide-react'
import { Doctor, searchDoctors } from '@/lib/dataService'

interface DoctorSearchProps {
  onScheduleAppointment: (doctor: Doctor) => void
}

export default function DoctorSearch({ onScheduleAppointment }: DoctorSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'specialization' | 'city'>('all')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const results = await searchDoctors(searchQuery, filterBy)
      setDoctors(results)
    } catch (error) {
      console.error('Error searching doctors:', error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterBy])

  const loadAllDoctors = useCallback(async () => {
    setLoading(true)
    try {
      const results = await searchDoctors('', 'all')
      setDoctors(results)
    } catch (error) {
      console.error('Error loading doctors:', error)
      setLoading(false)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      loadAllDoctors()
    }
  }, [searchQuery, filterBy, performSearch, loadAllDoctors])

  const handleScheduleAppointment = (doctor: Doctor) => {
    onScheduleAppointment(doctor)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Find a Doctor</h2>
        <p className="text-gray-600 mb-4">Search for doctors by specialization, location, or name</p>
        
        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search doctors by name, specialization, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex gap-3 mb-4">
            <Button
              variant={filterBy === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterBy('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterBy === 'specialization' ? 'default' : 'outline'}
              onClick={() => setFilterBy('specialization')}
              size="sm"
            >
              Specialization
            </Button>
            <Button
              variant={filterBy === 'city' ? 'default' : 'outline'}
              onClick={() => setFilterBy('city')}
              size="sm"
            >
              City
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Searching for doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No doctors found matching your search criteria</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {doctor.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {doctor.specialization}
                        </Badge>
                        <Badge 
                          variant={doctor.isAvailable ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {doctor.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(doctor.rating)}
                      </div>
                      <p className="text-sm text-gray-600">{doctor.rating}/5</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.location}, {doctor.city}</span>
                  </div>

                  {/* Experience & Education */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{doctor.experience} experience</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span className="truncate">{doctor.education}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {doctor.bio}
                  </p>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>

                  {/* Consultation Fee */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-500">Consultation:</span>
                      <span className="font-semibold text-gray-900 ml-1">Rs. {doctor.consultationFee}</span>
                    </div>
                    <Button
                      onClick={() => handleScheduleAppointment(doctor)}
                      disabled={!doctor.isAvailable}
                      className="px-4 py-2"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
