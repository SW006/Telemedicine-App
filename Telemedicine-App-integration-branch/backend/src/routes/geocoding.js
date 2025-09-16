const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { 
  reverseGeocode, 
  forwardGeocode, 
  validateCoordinates,
  getLocationInfo,
  getCachedGeocode,
  setCachedGeocode 
} = require('../services/location');

// Reverse geocoding - convert coordinates to address
router.post('/reverse', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Validate coordinates
    const validation = validateCoordinates(latitude, longitude);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided',
        details: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }
    
    // Check cache first
    const cacheKey = `reverse_${validation.latitude}_${validation.longitude}`;
    let result = getCachedGeocode(cacheKey);
    
    if (!result) {
      // Perform reverse geocoding
      result = await reverseGeocode(validation.latitude, validation.longitude);
      
      // Cache the result
      setCachedGeocode(cacheKey, result);
    }
    
    res.json({
      success: true,
      result: result,
      cached: !!getCachedGeocode(cacheKey)
    });
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform reverse geocoding',
      details: error.message
    });
  }
});

// Forward geocoding - convert address to coordinates
router.post('/forward', authMiddleware, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Address is required and must be a non-empty string'
      });
    }
    
    const normalizedAddress = address.trim().toLowerCase();
    
    // Check cache first
    const cacheKey = `forward_${normalizedAddress}`;
    let result = getCachedGeocode(cacheKey);
    
    if (!result) {
      // Perform forward geocoding
      result = await forwardGeocode(address);
      
      // Cache the result
      setCachedGeocode(cacheKey, result);
    }
    
    res.json({
      success: true,
      result: result,
      cached: !!getCachedGeocode(cacheKey)
    });
    
  } catch (error) {
    console.error('Forward geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform forward geocoding',
      details: error.message
    });
  }
});

// Get detailed location information
router.post('/location-info', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Validate coordinates
    const validation = validateCoordinates(latitude, longitude);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided'
      });
    }
    
    // Check cache first
    const cacheKey = `location_info_${validation.latitude}_${validation.longitude}`;
    let result = getCachedGeocode(cacheKey);
    
    if (!result) {
      // Get location information
      result = await getLocationInfo(validation.latitude, validation.longitude);
      
      // Cache the result
      setCachedGeocode(cacheKey, result);
    }
    
    res.json({
      success: true,
      locationInfo: result,
      cached: !!getCachedGeocode(cacheKey)
    });
    
  } catch (error) {
    console.error('Location info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get location information',
      details: error.message
    });
  }
});

// Validate coordinates endpoint
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const validation = validateCoordinates(latitude, longitude);
    
    res.json({
      success: true,
      isValid: validation.isValid,
      coordinates: validation.isValid ? {
        latitude: validation.latitude,
        longitude: validation.longitude
      } : null,
      error: validation.isValid ? null : 'Invalid coordinate values'
    });
    
  } catch (error) {
    console.error('Coordinate validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate coordinates'
    });
  }
});

// Batch geocoding for multiple addresses
router.post('/batch/forward', authMiddleware, async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Addresses must be a non-empty array'
      });
    }
    
    if (addresses.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 addresses allowed per batch request'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      
      if (!address || typeof address !== 'string') {
        errors.push({
          index: i,
          address: address,
          error: 'Invalid address format'
        });
        continue;
      }
      
      try {
        const normalizedAddress = address.trim().toLowerCase();
        const cacheKey = `forward_${normalizedAddress}`;
        let result = getCachedGeocode(cacheKey);
        
        if (!result) {
          result = await forwardGeocode(address);
          setCachedGeocode(cacheKey, result);
        }
        
        results.push({
          index: i,
          address: address,
          result: result,
          cached: !!getCachedGeocode(cacheKey)
        });
        
      } catch (error) {
        errors.push({
          index: i,
          address: address,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      results: results,
      errors: errors,
      totalProcessed: addresses.length,
      successCount: results.length,
      errorCount: errors.length
    });
    
  } catch (error) {
    console.error('Batch geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform batch geocoding'
    });
  }
});

// Batch reverse geocoding for multiple coordinates
router.post('/batch/reverse', authMiddleware, async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates must be a non-empty array'
      });
    }
    
    if (coordinates.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 coordinate pairs allowed per batch request'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      
      if (!coord || typeof coord.latitude === 'undefined' || typeof coord.longitude === 'undefined') {
        errors.push({
          index: i,
          coordinates: coord,
          error: 'Invalid coordinate format - latitude and longitude required'
        });
        continue;
      }
      
      const validation = validateCoordinates(coord.latitude, coord.longitude);
      if (!validation.isValid) {
        errors.push({
          index: i,
          coordinates: coord,
          error: 'Invalid coordinate values'
        });
        continue;
      }
      
      try {
        const cacheKey = `reverse_${validation.latitude}_${validation.longitude}`;
        let result = getCachedGeocode(cacheKey);
        
        if (!result) {
          result = await reverseGeocode(validation.latitude, validation.longitude);
          setCachedGeocode(cacheKey, result);
        }
        
        results.push({
          index: i,
          coordinates: {
            latitude: validation.latitude,
            longitude: validation.longitude
          },
          result: result,
          cached: !!getCachedGeocode(cacheKey)
        });
        
      } catch (error) {
        errors.push({
          index: i,
          coordinates: coord,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      results: results,
      errors: errors,
      totalProcessed: coordinates.length,
      successCount: results.length,
      errorCount: errors.length
    });
    
  } catch (error) {
    console.error('Batch reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform batch reverse geocoding'
    });
  }
});

// Get geocoding service status and configuration
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const status = {
      service: process.env.GEOCODING_SERVICE || 'nominatim',
      services: {
        google: {
          available: !!process.env.GOOGLE_MAPS_API_KEY,
          configured: !!process.env.GOOGLE_MAPS_API_KEY
        },
        mapbox: {
          available: !!process.env.MAPBOX_ACCESS_TOKEN,
          configured: !!process.env.MAPBOX_ACCESS_TOKEN
        },
        nominatim: {
          available: true,
          configured: true,
          note: 'Free OpenStreetMap service - no API key required'
        }
      },
      cacheEnabled: true,
      cacheDuration: '24 hours'
    };
    
    res.json({
      success: true,
      status: status
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get geocoding service status'
    });
  }
});

// Clear geocoding cache (admin only)
router.delete('/cache', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can clear the geocoding cache'
      });
    }
    
    // Clear cache by creating a new Map instance
    const { geocodeCache } = require('../services/location');
    geocodeCache.clear();
    
    res.json({
      success: true,
      message: 'Geocoding cache cleared successfully'
    });
    
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear geocoding cache'
    });
  }
});

// Get cache statistics (admin only)
router.get('/cache/stats', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can view cache statistics'
      });
    }
    
    const { geocodeCache } = require('../services/location');
    
    const stats = {
      totalEntries: geocodeCache.size,
      maxEntries: 1000,
      cacheUtilization: ((geocodeCache.size / 1000) * 100).toFixed(2) + '%'
    };
    
    res.json({
      success: true,
      cacheStats: stats
    });
    
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
});

module.exports = router;