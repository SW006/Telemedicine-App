'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  Shield,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmergencyButtonProps {
  userId: string;
  isVisible?: boolean;
  onEmergencyTriggered?: (emergencyId: string) => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'ambulance' | 'fire_dept' | 'police';
  phone: string;
  distance?: number;
  responseTime?: number;
}

export default function EmergencyButton({ 
  userId, 
  isVisible = true, 
  onEmergencyTriggered 
}: EmergencyButtonProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [nearbyServices, setNearbyServices] = useState<EmergencyService[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [emergencyId, setEmergencyId] = useState<string>('');
  const [alertSent, setAlertSent] = useState(false);

  // Load emergency contacts
  useEffect(() => {
    const loadEmergencyContacts = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/emergency-contacts`);
        const contacts = await response.json();
        setEmergencyContacts(contacts);
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
      }
    };

    if (userId) {
      loadEmergencyContacts();
    }
  }, [userId]);

  // Get current location
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      setIsGettingLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `/api/geocoding/reverse?lat=${location.latitude}&lng=${location.longitude}`
            );
            const data = await response.json();
            location.address = data.address;
          } catch (error) {
            console.error('Error getting address:', error);
          }

          setIsGettingLocation(false);
          setCurrentLocation(location);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Find nearby emergency services
  const findNearbyServices = async (location: LocationData) => {
    try {
      const response = await fetch('/api/emergency-services/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 25 // 25km radius
        }),
      });

      const services = await response.json();
      setNearbyServices(services);
    } catch (error) {
      console.error('Error finding nearby services:', error);
    }
  };

  // Handle emergency activation
  const activateEmergency = async () => {
    try {
      setIsActivated(true);
      
      // Get location first
      const location = await getCurrentLocation();
      await findNearbyServices(location);

      // Start countdown
      let timeLeft = 10;
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          sendEmergencyAlert(location);
        }
      }, 1000);

      // Store interval to clear it if cancelled
      (window as any).emergencyCountdown = countdownInterval;

    } catch (error) {
      console.error('Error activating emergency:', error);
      setIsActivated(false);
    }
  };

  // Cancel emergency (within countdown period)
  const cancelEmergency = () => {
    if ((window as any).emergencyCountdown) {
      clearInterval((window as any).emergencyCountdown);
    }
    setIsActivated(false);
    setCountdown(10);
    setShowConfirmation(false);
  };

  // Send emergency alert
  const sendEmergencyAlert = async (location?: LocationData) => {
    try {
      const alertData = {
        userId,
        alertType: 'panic_button',
        severity: 'critical',
        locationData: location || currentLocation,
        timestamp: new Date().toISOString(),
        emergencyContacts: emergencyContacts,
        nearbyServices: nearbyServices
      };

      const response = await fetch('/api/emergency/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      const result = await response.json();
      setEmergencyId(result.emergencyId);
      setAlertSent(true);
      
      if (onEmergencyTriggered) {
        onEmergencyTriggered(result.emergencyId);
      }

      // Continue calling emergency services
      callEmergencyServices();

    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  };

  // Call emergency services
  const callEmergencyServices = () => {
    // In a real app, this would trigger automatic calls
    // For demo, we'll show the emergency services
    setShowConfirmation(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Emergency Button */}
      {!isActivated && !alertSent && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={activateEmergency}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
            disabled={isGettingLocation}
          >
            <AlertTriangle className="w-8 h-8 text-white" />
          </Button>
        </div>
      )}

      {/* Emergency Activation Modal */}
      {isActivated && !alertSent && (
        <div className="fixed inset-0 bg-red-600 bg-opacity-95 flex items-center justify-center z-50">
          <Card className="w-96 max-w-full mx-4">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-600">
                EMERGENCY ALERT ACTIVATED
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Countdown */}
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {countdown}
                </div>
                <p className="text-gray-600">
                  Emergency services will be contacted automatically
                </p>
              </div>

              {/* Location Status */}
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold">Location Status</div>
                  <div className="text-sm text-gray-600">
                    {isGettingLocation ? 'Getting location...' : 
                     currentLocation ? 'Location acquired' : 'Location unavailable'}
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              {emergencyContacts.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-green-600" />
                    Emergency Contacts
                  </div>
                  <div className="space-y-1">
                    {emergencyContacts.slice(0, 2).map(contact => (
                      <div key={contact.id} className="text-sm">
                        {contact.name} ({contact.relationship})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby Services */}
              {nearbyServices.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-yellow-600" />
                    Nearby Emergency Services
                  </div>
                  <div className="space-y-1">
                    {nearbyServices.slice(0, 2).map(service => (
                      <div key={service.id} className="text-sm">
                        {service.name} - {service.distance}km away
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancel Button */}
              <Button
                onClick={cancelEmergency}
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Emergency
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emergency Confirmation Modal */}
      {showConfirmation && alertSent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-full mx-4">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">
                Emergency Alert Sent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                Emergency ID: <strong>{emergencyId}</strong>
              </div>

              {/* Current Location */}
              {currentLocation && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Your Location
                  </div>
                  <div className="text-sm">
                    {currentLocation.address || 
                     `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
                  </div>
                </div>
              )}

              {/* Emergency Services Called */}
              <div className="space-y-3">
                <div className="font-semibold">Emergency Services Contacted:</div>
                {nearbyServices.slice(0, 3).map(service => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">
                        {service.type.replace('_', ' ').toUpperCase()} • {service.distance}km
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.open(`tel:${service.phone}`, '_self')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                ))}
              </div>

              {/* Emergency Contacts Notified */}
              {emergencyContacts.length > 0 && (
                <div className="space-y-3">
                  <div className="font-semibold">Emergency Contacts Notified:</div>
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-600">
                          {contact.relationship} • {contact.phone}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setShowConfirmation(false);
                    setAlertSent(false);
                    setIsActivated(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
                
                <div className="text-center">
                  <button
                    onClick={() => {
                      // Report false alarm
                      fetch(`/api/emergency/${emergencyId}/false-alarm`, {
                        method: 'POST'
                      });
                      setShowConfirmation(false);
                      setAlertSent(false);
                      setIsActivated(false);
                    }}
                    className="text-sm text-gray-500 underline hover:text-gray-700"
                  >
                    Report False Alarm
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}