'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface GoogleMaps {
  maps: {
    Map: new (element: HTMLElement, options: MapOptions) => GoogleMap
    Geocoder: new () => GoogleGeocoder
    places: {
      PlacesService: new (map: GoogleMap) => GooglePlacesService
      PlacesServiceStatus: {
        OK: string
      }
    }
    Marker: new (options: MarkerOptions) => GoogleMarker
    InfoWindow: new (options: InfoWindowOptions) => GoogleInfoWindow
  }
}

interface MapOptions {
  center: { lat: number; lng: number }
  zoom: number
}

interface MarkerOptions {
  position: { lat: number; lng: number }
  map: GoogleMap
  title: string
}

interface InfoWindowOptions {
  content: string
}

interface GoogleMap {
  setCenter: (location: { lat: number; lng: number }) => void
}

interface GoogleGeocoder {
  geocode: (request: { address: string }, callback: (results: GeocoderResult[], status: string) => void) => void
}

interface GooglePlacesService {
  nearbySearch: (request: PlacesSearchRequest, callback: (places: Place[], status: string) => void) => void
}

interface PlacesSearchRequest {
  location: { lat: number; lng: number }
  radius: number
  type: string[]
}

interface GoogleMarker {
  setMap: (map: GoogleMap | null) => void
  addListener: (event: string, callback: () => void) => void
}

interface GoogleInfoWindow {
  open: (map: GoogleMap, marker: GoogleMarker) => void
}

interface GeocoderResult {
  geometry: {
    location: { lat: number; lng: number }
  }
}

interface Place {
  geometry: {
    location: { lat: number; lng: number }
  }
  name: string
  vicinity: string
}

declare global {
  interface Window {
    google: GoogleMaps
  }
}

export default function PatientMapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<GoogleMap | null>(null)
  const [location, setLocation] = useState('')
  const [markers, setMarkers] = useState<GoogleMarker[]>([])

  // Load Google Maps script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.onload = () => initMap()
    document.body.appendChild(script)
  }, [])

  const initMap = () => {
    if (!mapRef.current) return
    
    const defaultCenter = { lat: 37.7749, lng: -122.4194 } // San Francisco fallback

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
    })

    setMap(mapInstance)
  }

  const findHospitals = () => {
    if (!map || !location) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: location }, (results: GeocoderResult[], status: string) => {
      if (status === 'OK' && results[0]) {
        map.setCenter(results[0].geometry.location)

        // Clear old markers
        markers.forEach((marker) => marker.setMap(null))
        setMarkers([])

        const service = new window.google.maps.places.PlacesService(map)
        service.nearbySearch(
          {
            location: results[0].geometry.location,
            radius: 5000, // 5km radius
            type: ['hospital'],
          },
          (places: Place[], status: string) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && places.length) {
              const newMarkers = places.map((place: Place) => {
                const marker = new window.google.maps.Marker({
                  position: place.geometry.location,
                  map,
                  title: place.name,
                })

                const infowindow = new window.google.maps.InfoWindow({
                  content: `<div><strong>${place.name}</strong><br>${place.vicinity}</div>`,
                })

                marker.addListener('click', () => {
                  infowindow.open(map, marker)
                })

                return marker
              })

              setMarkers(newMarkers)
            }
          }
        )
      } else {
        alert('Location not found')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter a location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button onClick={findHospitals} className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">Find Hospitals</Button>
      </div>
      <div ref={mapRef} className="w-full h-[600px] rounded-lg border border-gray-200" />
    </div>
  )
}
