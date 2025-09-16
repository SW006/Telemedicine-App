const Joi = require('joi');

// Emergency alert validation schema
const emergencyAlertSchema = Joi.object({
  alertType: Joi.string()
    .valid('medical', 'fire', 'police', 'general', 'fall_detected', 'vitals_critical', 'panic')
    .required()
    .messages({
      'any.only': 'Alert type must be one of: medical, fire, police, general, fall_detected, vitals_critical, panic',
      'any.required': 'Alert type is required'
    }),
  
  severity: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .required()
    .messages({
      'any.only': 'Severity must be one of: low, medium, high, critical',
      'any.required': 'Severity is required'
    }),
  
  locationData: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .optional(),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .optional(),
    
    accuracy: Joi.number().min(0).optional(),
    
    address: Joi.string().max(500).optional(),
    
    timestamp: Joi.date().iso().optional()
  }).optional(),
  
  vitalData: Joi.object({
    heartRate: Joi.number().min(30).max(250).optional(),
    bloodPressure: Joi.object({
      systolic: Joi.number().min(50).max(300),
      diastolic: Joi.number().min(30).max(200)
    }).optional(),
    oxygenSaturation: Joi.number().min(70).max(100).optional(),
    temperature: Joi.number().min(90).max(115).optional(), // Fahrenheit
    glucoseLevel: Joi.number().min(20).max(600).optional(), // mg/dL
    timestamp: Joi.date().iso().optional()
  }).optional(),
  
  alertMessage: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Alert message cannot exceed 1000 characters'
    }),
  
  deviceInfo: Joi.object({
    type: Joi.string().valid('mobile', 'wearable', 'iot_sensor', 'manual').optional(),
    model: Joi.string().max(100).optional(),
    batteryLevel: Joi.number().min(0).max(100).optional()
  }).optional()
});

// Emergency contact validation schema
const emergencyContactSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  relationship: Joi.string()
    .valid('parent', 'spouse', 'sibling', 'child', 'relative', 'friend', 'caregiver', 'doctor', 'other')
    .required()
    .messages({
      'any.only': 'Relationship must be one of: parent, spouse, sibling, child, relative, friend, caregiver, doctor, other',
      'any.required': 'Relationship is required'
    }),
  
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]{10,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be a valid format (10-20 digits)',
      'any.required': 'Phone number is required'
    }),
  
  email: Joi.string()
    .email()
    .max(255)
    .optional()
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email cannot exceed 255 characters'
    }),
  
  isPrimary: Joi.boolean().optional().default(false),
  
  canMakeMedicalDecisions: Joi.boolean().optional().default(false),
  
  address: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    })
});

// Location validation schema
const locationSchema = Joi.object({
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  
  radius: Joi.number()
    .min(1)
    .max(100)
    .optional()
    .default(25)
    .messages({
      'number.min': 'Radius must be at least 1 km',
      'number.max': 'Radius cannot exceed 100 km'
    })
});

// Alert status update validation schema
const alertStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'acknowledged', 'resolved', 'false_alarm')
    .required()
    .messages({
      'any.only': 'Status must be one of: active, acknowledged, resolved, false_alarm',
      'any.required': 'Status is required'
    }),
  
  resolutionNotes: Joi.string()
    .max(2000)
    .optional()
    .messages({
      'string.max': 'Resolution notes cannot exceed 2000 characters'
    }),
  
  responderId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.uuid': 'Responder ID must be a valid UUID'
    })
});

// Validation middleware functions
const validateEmergencyAlert = (req, res, next) => {
  const { error, value } = emergencyAlertSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  
  // Additional business logic validation
  if (value.vitalData && value.alertType === 'vitals_critical') {
    // Check if vital signs are actually critical
    const vitals = value.vitalData;
    let isCritical = false;
    
    if (vitals.heartRate && (vitals.heartRate < 50 || vitals.heartRate > 180)) {
      isCritical = true;
    }
    
    if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) {
      isCritical = true;
    }
    
    if (vitals.bloodPressure) {
      const { systolic, diastolic } = vitals.bloodPressure;
      if (systolic > 200 || systolic < 70 || diastolic > 120 || diastolic < 40) {
        isCritical = true;
      }
    }
    
    if (!isCritical) {
      return res.status(400).json({
        success: false,
        error: 'Vital signs do not meet critical alert criteria'
      });
    }
  }
  
  req.body = value;
  next();
};

const validateEmergencyContact = (req, res, next) => {
  const { error, value } = emergencyContactSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  
  req.body = value;
  next();
};

const validateLocation = (req, res, next) => {
  const { error, value } = locationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  
  req.body = value;
  next();
};

const validateAlertStatus = (req, res, next) => {
  const { error, value } = alertStatusSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  
  req.body = value;
  next();
};

// Custom validation helpers
const isValidVitalSigns = (vitalData) => {
  if (!vitalData) return true;
  
  // Check each vital sign for reasonable ranges
  const checks = {
    heartRate: vitalData.heartRate >= 30 && vitalData.heartRate <= 250,
    oxygenSaturation: !vitalData.oxygenSaturation || (vitalData.oxygenSaturation >= 70 && vitalData.oxygenSaturation <= 100),
    temperature: !vitalData.temperature || (vitalData.temperature >= 90 && vitalData.temperature <= 115)
  };
  
  if (vitalData.bloodPressure) {
    const bp = vitalData.bloodPressure;
    checks.bloodPressure = bp.systolic >= 50 && bp.systolic <= 300 && 
                          bp.diastolic >= 30 && bp.diastolic <= 200;
  }
  
  return Object.values(checks).every(Boolean);
};

const getCriticalVitalThresholds = () => {
  return {
    heartRate: { min: 50, max: 180 },
    oxygenSaturation: { min: 90 },
    bloodPressure: {
      systolic: { min: 70, max: 200 },
      diastolic: { min: 40, max: 120 }
    },
    temperature: { min: 95, max: 104 }, // Fahrenheit
    glucoseLevel: { min: 50, max: 400 }
  };
};

module.exports = {
  validateEmergencyAlert,
  validateEmergencyContact,
  validateLocation,
  validateAlertStatus,
  isValidVitalSigns,
  getCriticalVitalThresholds,
  
  // Export schemas for testing
  schemas: {
    emergencyAlertSchema,
    emergencyContactSchema,
    locationSchema,
    alertStatusSchema
  }
};