const axios = require('axios');
const { pool } = require('../db/pool');

// Find nearby emergency services using database with PostGIS
const findNearbyServices = async (latitude, longitude, radius = 25, serviceType = null) => {
  try {
    let query = `
      SELECT 
        id, name, type, phone, email, address, city, state,
        ST_Distance(
          ST_Point($1, $2)::geography,
          coordinates::geography
        ) / 1000 as distance_km,
        response_time_avg,
        specialties,
        is_24_7,
        capacity_info,
        contact_person,
        emergency_line
      FROM emergency_services 
      WHERE is_active = true 
        AND ST_DWithin(
          ST_Point($1, $2)::geography,
          coordinates::geography,
          $3 * 1000
        )
    `;
    
    const params = [longitude, latitude, radius];
    
    // Filter by service type if specified
    if (serviceType) {
      query += ` AND type = $4`;
      params.push(serviceType);
    }
    
    query += ` ORDER BY distance_km ASC LIMIT 20`;
    
    const result = await pool.query(query, params);
    
    return result.rows.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      phone: service.phone,
      email: service.email,
      address: service.address,
      city: service.city,
      state: service.state,
      distance: parseFloat(service.distance_km).toFixed(1),
      responseTime: service.response_time_avg,
      specialties: service.specialties,
      is24_7: service.is_24_7,
      capacityInfo: service.capacity_info,
      contactPerson: service.contact_person,
      emergencyLine: service.emergency_line
    }));
    
  } catch (error) {
    console.error('Error finding nearby services:', error);
    throw new Error('Failed to find nearby emergency services');
  }
};

// Reverse geocoding - convert coordinates to address
const reverseGeocode = async (latitude, longitude) => {
  try {
    const geocodeService = process.env.GEOCODING_SERVICE || 'nominatim';
    
    let address = null;
    
    if (geocodeService === 'google' && process.env.GOOGLE_MAPS_API_KEY) {
      address = await reverseGeocodeGoogle(latitude, longitude);
    } else if (geocodeService === 'mapbox' && process.env.MAPBOX_ACCESS_TOKEN) {
      address = await reverseGeocodeMapbox(latitude, longitude);
    } else {
      // Default to free Nominatim service
      address = await reverseGeocodeNominatim(latitude, longitude);
    }
    
    return {
      latitude,
      longitude,
      address: address.formatted_address,
      components: address.components,
      accuracy: address.accuracy || 'unknown'
    };
    
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {
      latitude,
      longitude,
      address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      components: {},
      accuracy: 'coordinates_only'
    };
  }
};

// Google Maps reverse geocoding
const reverseGeocodeGoogle = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${latitude},${longitude}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
        result_type: 'street_address|route|neighborhood|locality'
      },
      timeout: 5000
    });
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      const components = {};
      result.address_components.forEach(component => {
        component.types.forEach(type => {
          components[type] = component.long_name;
        });
      });
      
      return {
        formatted_address: result.formatted_address,
        components: {
          street_number: components.street_number,
          route: components.route,
          neighborhood: components.neighborhood,
          locality: components.locality,
          administrative_area_level_1: components.administrative_area_level_1,
          country: components.country,
          postal_code: components.postal_code
        },
        accuracy: result.geometry.location_type.toLowerCase()
      };
    }
    
    throw new Error('No results from Google Geocoding API');
    
  } catch (error) {
    console.error('Google reverse geocoding failed:', error);
    throw error;
  }
};

// Mapbox reverse geocoding
const reverseGeocodeMapbox = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_ACCESS_TOKEN,
          types: 'address,place,locality',
          limit: 1
        },
        timeout: 5000
      }
    );
    
    if (response.data.features.length > 0) {
      const feature = response.data.features[0];
      
      const components = {};
      if (feature.context) {
        feature.context.forEach(ctx => {
          const [type] = ctx.id.split('.');
          components[type] = ctx.text;
        });
      }
      
      return {
        formatted_address: feature.place_name,
        components: {
          address: feature.address,
          place_name: feature.text,
          locality: components.place,
          region: components.region,
          country: components.country,
          postal_code: components.postcode
        },
        accuracy: feature.properties.accuracy || 'high'
      };
    }
    
    throw new Error('No results from Mapbox Geocoding API');
    
  } catch (error) {
    console.error('Mapbox reverse geocoding failed:', error);
    throw error;
  }
};

// Nominatim reverse geocoding (free OpenStreetMap service)
const reverseGeocodeNominatim = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
        zoom: 18
      },
      headers: {
        'User-Agent': 'TeleTabib-Emergency-System/1.0'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.display_name) {
      const data = response.data;
      
      return {
        formatted_address: data.display_name,
        components: {
          house_number: data.address?.house_number,
          road: data.address?.road,
          neighborhood: data.address?.neighbourhood || data.address?.suburb,
          locality: data.address?.city || data.address?.town || data.address?.village,
          state: data.address?.state,
          country: data.address?.country,
          postal_code: data.address?.postcode
        },
        accuracy: data.importance > 0.5 ? 'high' : 'medium'
      };
    }
    
    throw new Error('No results from Nominatim API');
    
  } catch (error) {
    console.error('Nominatim reverse geocoding failed:', error);
    throw error;
  }
};

// Forward geocoding - convert address to coordinates
const forwardGeocode = async (address) => {
  try {
    const geocodeService = process.env.GEOCODING_SERVICE || 'nominatim';
    
    let result = null;
    
    if (geocodeService === 'google' && process.env.GOOGLE_MAPS_API_KEY) {
      result = await forwardGeocodeGoogle(address);
    } else if (geocodeService === 'mapbox' && process.env.MAPBOX_ACCESS_TOKEN) {
      result = await forwardGeocodeMapbox(address);
    } else {
      result = await forwardGeocodeNominatim(address);
    }
    
    return result;
    
  } catch (error) {
    console.error('Forward geocoding failed:', error);
    throw new Error('Failed to geocode address');
  }
};

// Google Maps forward geocoding
const forwardGeocodeGoogle = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 5000
    });
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        accuracy: result.geometry.location_type.toLowerCase()
      };
    }
    
    throw new Error('No results from Google Geocoding API');
    
  } catch (error) {
    console.error('Google forward geocoding failed:', error);
    throw error;
  }
};

// Mapbox forward geocoding
const forwardGeocodeMapbox = async (address) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_ACCESS_TOKEN,
          limit: 1
        },
        timeout: 5000
      }
    );
    
    if (response.data.features.length > 0) {
      const feature = response.data.features[0];
      const [longitude, latitude] = feature.center;
      
      return {
        latitude: latitude,
        longitude: longitude,
        formatted_address: feature.place_name,
        accuracy: feature.properties.accuracy || 'high'
      };
    }
    
    throw new Error('No results from Mapbox Geocoding API');
    
  } catch (error) {
    console.error('Mapbox forward geocoding failed:', error);
    throw error;
  }
};

// Nominatim forward geocoding
const forwardGeocodeNominatim = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'TeleTabib-Emergency-System/1.0'
      },
      timeout: 10000
    });
    
    if (response.data.length > 0) {
      const result = response.data[0];
      
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formatted_address: result.display_name,
        accuracy: result.importance > 0.5 ? 'high' : 'medium'
      };
    }
    
    throw new Error('No results from Nominatim API');
    
  } catch (error) {
    console.error('Nominatim forward geocoding failed:', error);
    throw error;
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Get timezone for coordinates
const getTimezone = async (latitude, longitude) => {
  try {
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const response = await axios.get('https://maps.googleapis.com/maps/api/timezone/json', {
        params: {
          location: `${latitude},${longitude}`,
          timestamp: Math.floor(Date.now() / 1000),
          key: process.env.GOOGLE_MAPS_API_KEY
        },
        timeout: 5000
      });
      
      if (response.data.status === 'OK') {
        return {
          timeZoneId: response.data.timeZoneId,
          timeZoneName: response.data.timeZoneName,
          rawOffset: response.data.rawOffset,
          dstOffset: response.data.dstOffset
        };
      }
    }
    
    // Fallback to UTC if no API key or service fails
    return {
      timeZoneId: 'UTC',
      timeZoneName: 'Coordinated Universal Time',
      rawOffset: 0,
      dstOffset: 0
    };
    
  } catch (error) {
    console.error('Timezone lookup failed:', error);
    return {
      timeZoneId: 'UTC',
      timeZoneName: 'Coordinated Universal Time',
      rawOffset: 0,
      dstOffset: 0
    };
  }
};

// Validate coordinates
const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  return {
    isValid: !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180,
    latitude: lat,
    longitude: lon
  };
};

// Get country and region info from coordinates
const getLocationInfo = async (latitude, longitude) => {
  try {
    const geocodeResult = await reverseGeocode(latitude, longitude);
    
    return {
      country: geocodeResult.components.country,
      state: geocodeResult.components.administrative_area_level_1 || geocodeResult.components.region,
      city: geocodeResult.components.locality,
      address: geocodeResult.address,
      coordinates: { latitude, longitude }
    };
    
  } catch (error) {
    console.error('Failed to get location info:', error);
    return {
      country: 'Unknown',
      state: 'Unknown',
      city: 'Unknown',
      address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      coordinates: { latitude, longitude }
    };
  }
};

// Cache frequent geocoding results
const geocodeCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCachedGeocode = (key) => {
  const cached = geocodeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedGeocode = (key, data) => {
  geocodeCache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  
  // Clean old cache entries periodically
  if (geocodeCache.size > 1000) {
    const now = Date.now();
    for (const [cacheKey, value] of geocodeCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        geocodeCache.delete(cacheKey);
      }
    }
  }
};

module.exports = {
  findNearbyServices,
  reverseGeocode,
  forwardGeocode,
  calculateDistance,
  getTimezone,
  validateCoordinates,
  getLocationInfo,
  
  // Utility functions
  getCachedGeocode,
  setCachedGeocode,
  
  // For testing individual services
  reverseGeocodeGoogle,
  reverseGeocodeMapbox,
  reverseGeocodeNominatim,
  forwardGeocodeGoogle,
  forwardGeocodeMapbox,
  forwardGeocodeNominatim
};