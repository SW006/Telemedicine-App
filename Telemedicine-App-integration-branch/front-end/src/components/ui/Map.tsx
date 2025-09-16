'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Loader2 } from 'lucide-react'

// Avoid augmenting Window globally to prevent type conflicts. Cast at usage sites instead.

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyBR-nX7MDypyRsCSxKhSV9Wekdpcdmc3yw',
      version: 'weekly'
    })

    loader.load()
      .then(() => {
        if (mapRef.current) {
          const map = new (window as any).google.maps.Map(mapRef.current, {
            center: { lat: 40.7128, lng: -74.006 }, // New York
            zoom: 12,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }]
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e9e9e9' }]
              },
              {
                featureType: 'poi.medical',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'on' }]
              }
            ]
          })

          // Add some sample markers for healthcare facilities
          const healthcareFacilities = [
            { lat: 40.7589, lng: -73.9851, title: 'Manhattan Medical Center' },
            { lat: 40.7505, lng: -73.9934, title: 'Downtown Health Clinic' },
            { lat: 40.7484, lng: -73.9857, title: 'Central Park Medical Group' },
            { lat: 40.7549, lng: -73.9840, title: 'Times Square Healthcare' },
            { lat: 40.7527, lng: -73.9772, title: 'Grand Central Medical' }
          ]

          healthcareFacilities.forEach(facility => {
            new (window as any).google.maps.Marker({
              position: { lat: facility.lat, lng: facility.lng },
              map: map,
              title: facility.title,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                `),
                scaledSize: new (window as any).google.maps.Size(24, 24)
              }
            })
          })

          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load map')
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-gray-600 font-medium">Loading healthcare facilities...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <MapPin className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-gray-600 font-medium">{error}</p>
            <p className="text-sm text-gray-500">Please try refreshing the page</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="w-full h-full"
      />
      
      {/* Map overlay with info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Healthcare Facilities</p>
            <p className="text-xs text-gray-600">Click markers for details</p>
          </div>
        </div>
      </div>
    </div>
  )
}
