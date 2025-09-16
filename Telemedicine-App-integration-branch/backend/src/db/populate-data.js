const { Pool } = require('pg');
require('dotenv').config();

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Doctor specializations
const specializations = [
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Internal Medicine',
  'Family Medicine',
  'Gastroenterology',
  'Endocrinology',
  'Urology',
  'Pulmonology'
];

// Cities
const cities = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Hyderabad'
];

// Sample doctors data
const doctors = [
  {
    name: 'Dr. Fatima Malik',
    email: 'fatima.malik@hospital.com',
    phone: '+92 (333) 987-6543',
    specialization: 'Cardiology',
    experience: '15 years',
    education: 'MD, Aga Khan University',
    location: 'Medical Center Downtown',
    city: 'Karachi',
    bio: 'Experienced cardiologist specializing in interventional cardiology and preventive care.',
    availability: 'Monday-Friday, 9 AM - 5 PM',
    languages: ['English', 'Urdu'],
    certifications: ['Board Certified Cardiologist', 'Fellowship in Interventional Cardiology'],
    rating: 4.8,
    consultationFee: 5000,
    isAvailable: true
  },
  {
    name: 'Dr. Imran Siddiqui',
    email: 'imran.siddiqui@clinic.com',
    phone: '+92 (334) 123-4567',
    specialization: 'Dermatology',
    experience: '12 years',
    education: 'MD, King Edward Medical University',
    location: 'Skin Care Clinic',
    city: 'Lahore',
    bio: 'Board-certified dermatologist with expertise in skin cancer detection and cosmetic dermatology.',
    availability: 'Monday-Saturday, 8 AM - 6 PM',
    languages: ['English', 'Urdu', 'Punjabi'],
    certifications: ['Board Certified Dermatologist', 'Fellowship in Mohs Surgery'],
    rating: 4.9,
    consultationFee: 4000,
    isAvailable: true
  },
  {
    name: 'Dr. Ayesha Rahman',
    email: 'ayesha.rahman@institute.com',
    phone: '+92 (335) 234-5678',
    specialization: 'Orthopedics',
    experience: '18 years',
    education: 'MD, Dow Medical College',
    location: 'Orthopedic Institute',
    city: 'Islamabad',
    bio: 'Specialist in sports medicine and joint replacement surgery with advanced training in minimally invasive techniques.',
    availability: 'Monday-Friday, 7 AM - 7 PM',
    languages: ['English', 'Urdu'],
    certifications: ['Board Certified Orthopedic Surgeon', 'Fellowship in Sports Medicine'],
    rating: 4.7,
    consultationFee: 6000,
    isAvailable: true
  },
  {
    name: 'Dr. Usman Farooq',
    email: 'usman.farooq@neurology.com',
    phone: '+92 (336) 345-6789',
    specialization: 'Neurology',
    experience: '20 years',
    education: 'MD, Shifa College of Medicine',
    location: 'Neurology Center',
    city: 'Rawalpindi',
    bio: 'Expert neurologist specializing in movement disorders and neurodegenerative diseases.',
    availability: 'Monday-Friday, 9 AM - 4 PM',
    languages: ['English', 'Urdu'],
    certifications: ['Board Certified Neurologist', 'Fellowship in Movement Disorders'],
    rating: 4.6,
    consultationFee: 7000,
    isAvailable: false
  },
  {
    name: 'Dr. Nadia Hussain',
    email: 'nadia.hussain@pediatrics.com',
    phone: '+92 (337) 456-7890',
    specialization: 'Pediatrics',
    experience: '14 years',
    education: 'MD, Allama Iqbal Medical College',
    location: 'Children\'s Medical Center',
    city: 'Faisalabad',
    bio: 'Pediatrician with special interest in childhood development and preventive care.',
    availability: 'Monday-Saturday, 8 AM - 6 PM',
    languages: ['English', 'Urdu', 'Punjabi'],
    certifications: ['Board Certified Pediatrician', 'Fellowship in Developmental Pediatrics'],
    rating: 4.9,
    consultationFee: 3500,
    isAvailable: true
  },
  {
    name: 'Dr. Zubair Ahmed',
    email: 'zubair.ahmed@psychiatry.com',
    phone: '+92 (338) 567-8901',
    specialization: 'Psychiatry',
    experience: '16 years',
    education: 'MD, Quaid-e-Azam Medical College',
    location: 'Mental Health Institute',
    city: 'Multan',
    bio: 'Psychiatrist specializing in mood disorders, anxiety, and cognitive behavioral therapy.',
    availability: 'Monday-Friday, 10 AM - 6 PM',
    languages: ['English', 'Urdu', 'Saraiki'],
    certifications: ['Board Certified Psychiatrist', 'Fellowship in Child Psychiatry'],
    rating: 4.5,
    consultationFee: 5500,
    isAvailable: true
  }
];

// Emergency services data
const emergencyServices = [
  {
    name: 'City Hospital Emergency',
    type: 'hospital',
    phone: '+92-21-3456789',
    email: 'emergency@cityhospital.com',
    address: '123 Main Street',
    city: 'Karachi',
    state: 'Sindh',
    lat: 24.8607,
    lng: 67.0011,
    responseTimeAvg: 15,
    specialties: ['trauma', 'cardiac', 'general'],
    is24_7: true,
    capacityInfo: JSON.stringify({beds: 50, occupancy: 65}),
    contactPerson: 'Dr. Ahmed Khan',
    emergencyLine: '+92-21-3456700'
  },
  {
    name: 'Lifeline Ambulance Service',
    type: 'ambulance',
    phone: '+92-42-9876543',
    email: 'dispatch@lifelineambulance.com',
    address: '456 Hospital Road',
    city: 'Lahore',
    state: 'Punjab',
    lat: 31.5204,
    lng: 74.3587,
    responseTimeAvg: 10,
    specialties: ['medical', 'trauma', 'transport'],
    is24_7: true,
    capacityInfo: JSON.stringify({vehicles: 20, available: 15}),
    contactPerson: 'Mohammad Ali',
    emergencyLine: '+92-42-9876500'
  },
  {
    name: 'Cardiac Care Emergency Center',
    type: 'specialized',
    phone: '+92-51-5432109',
    email: 'emergency@cardiaccare.com',
    address: '789 Health Avenue',
    city: 'Islamabad',
    state: 'Federal',
    lat: 33.6844,
    lng: 73.0479,
    responseTimeAvg: 8,
    specialties: ['cardiac', 'stroke'],
    is24_7: true,
    capacityInfo: JSON.stringify({beds: 30, occupancy: 50}),
    contactPerson: 'Dr. Fatima Shah',
    emergencyLine: '+92-51-5432100'
  }
];

// Pharmacies data
const pharmacies = [
  {
    name: 'CityCare Pharmacy',
    address: '12 Mall Rd',
    city: 'Lahore',
    phone: '+92-301-1234567',
    email: 'info@citycarephpharmacy.com',
    deliveryFee: 200,
    etaMinutes: 60,
    operatingHours: '9AM-10PM',
    paymentMethods: ['cash', 'card', 'online'],
    hasInsurancePartnership: true
  },
  {
    name: 'HealthPlus Pharmacy',
    address: '45 Clifton Ave',
    city: 'Karachi',
    phone: '+92-302-2345678',
    email: 'contact@healthplus.com',
    deliveryFee: 250,
    etaMinutes: 90,
    operatingHours: '24/7',
    paymentMethods: ['cash', 'card', 'online'],
    hasInsurancePartnership: false
  },
  {
    name: 'QuickMeds',
    address: '89 Blue Area',
    city: 'Islamabad',
    phone: '+92-303-3456789',
    email: 'support@quickmeds.pk',
    deliveryFee: 180,
    etaMinutes: 75,
    operatingHours: '8AM-11PM',
    paymentMethods: ['cash', 'online'],
    hasInsurancePartnership: true
  }
];

// Lab test facilities
const labFacilities = [
  {
    name: 'Chughtai Lab',
    address: '22 Main Boulevard',
    city: 'Lahore',
    phone: '+92-311-1122334',
    email: 'info@chughtailab.com',
    serviceHours: '7AM-10PM',
    homeCollection: true,
    processingTime: '24-48 hours',
    specialties: ['blood', 'urine', 'microbiology', 'histopathology']
  },
  {
    name: 'Agha Khan Diagnostic Center',
    address: '78 Stadium Road',
    city: 'Karachi',
    phone: '+92-312-2233445',
    email: 'labs@aku.edu',
    serviceHours: '24/7',
    homeCollection: true,
    processingTime: '12-24 hours',
    specialties: ['blood', 'urine', 'advanced_diagnostics', 'imaging']
  },
  {
    name: 'Excel Labs',
    address: '44 F-10 Markaz',
    city: 'Islamabad',
    phone: '+92-313-3344556',
    email: 'contact@excellabs.pk',
    serviceHours: '8AM-8PM',
    homeCollection: true,
    processingTime: '24 hours',
    specialties: ['blood', 'urine', 'hormones']
  }
];

// Lab tests
const labTests = [
  {
    name: 'Complete Blood Count (CBC)',
    category: 'blood',
    price: 1200,
    description: 'Measures red blood cells, white blood cells, platelets, and hemoglobin',
    preparationNeeded: 'No special preparation required',
    processingTime: '2-4 hours',
    reportFormat: 'digital and print'
  },
  {
    name: 'Lipid Profile',
    category: 'blood',
    price: 2000,
    description: 'Measures cholesterol, triglycerides, HDL, and LDL',
    preparationNeeded: 'Fasting for 9-12 hours required',
    processingTime: '4-6 hours',
    reportFormat: 'digital and print'
  },
  {
    name: 'Liver Function Test (LFT)',
    category: 'blood',
    price: 2500,
    description: 'Assesses liver function by measuring enzymes, proteins, and bilirubin',
    preparationNeeded: 'No alcohol for 24 hours before test',
    processingTime: '6-8 hours',
    reportFormat: 'digital and print'
  },
  {
    name: 'Thyroid Function Test (TFT)',
    category: 'blood',
    price: 3000,
    description: 'Measures thyroid hormones (TSH, T3, T4)',
    preparationNeeded: 'No special preparation required',
    processingTime: '6-8 hours',
    reportFormat: 'digital and print'
  },
  {
    name: 'Urinalysis',
    category: 'urine',
    price: 1000,
    description: 'Examines the physical, chemical, and microscopic aspects of urine',
    preparationNeeded: 'Clean catch midstream sample required',
    processingTime: '2-4 hours',
    reportFormat: 'digital and print'
  },
  {
    name: 'HbA1c',
    category: 'blood',
    price: 1800,
    description: 'Measures average blood glucose levels over 2-3 months',
    preparationNeeded: 'No special preparation required',
    processingTime: '4-6 hours',
    reportFormat: 'digital and print'
  }
];

// Populate database with data
async function populateDatabase() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting database population...');
    await client.query('BEGIN');

    // Insert specializations
    console.log('📊 Adding specializations...');
    for (const specialization of specializations) {
      await client.query(
        'INSERT INTO specializations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [specialization]
      );
    }

    // Insert cities
    console.log('🏙️ Adding cities...');
    for (const city of cities) {
      await client.query(
        'INSERT INTO cities (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [city]
      );
    }

    // Insert doctors
    console.log('👨‍⚕️ Adding doctors...');
    for (const doctor of doctors) {
      // First create user
      const userResult = await client.query(
        `INSERT INTO users (name, email, phone, password, role, created_at, status)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)
         ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone
         RETURNING id`,
        [
          doctor.name,
          doctor.email,
          doctor.phone,
          '$2b$12$7qwBvoiSyP8.wM3zxAU/YeGDQ58rE6/zTrEcJLcuhWt7r/YQ4dNM6', // hashed 'password123'
          'doctor',
          'active'
        ]
      );
      
      const userId = userResult.rows[0].id;
      
      // Check if doctor profile exists
      const doctorCheck = await client.query(
        'SELECT id FROM doctor_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (doctorCheck.rows.length === 0) {
        // Insert doctor profile
        await client.query(
          `INSERT INTO doctor_profiles (
            user_id, specialization, experience, education, bio,
            location, city, availability, languages, certifications,
            rating, consultation_fee, is_available, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
          [
            userId,
            doctor.specialization,
            doctor.experience,
            doctor.education,
            doctor.bio,
            doctor.location,
            doctor.city,
            doctor.availability,
            doctor.languages,
            doctor.certifications,
            doctor.rating,
            doctor.consultationFee,
            doctor.isAvailable
          ]
        );
      } else {
        // Update doctor profile
        await client.query(
          `UPDATE doctor_profiles SET
           specialization = $2, experience = $3, education = $4, bio = $5,
           location = $6, city = $7, availability = $8, languages = $9,
           certifications = $10, rating = $11, consultation_fee = $12,
           is_available = $13, updated_at = NOW()
           WHERE user_id = $1`,
          [
            userId,
            doctor.specialization,
            doctor.experience,
            doctor.education,
            doctor.bio,
            doctor.location,
            doctor.city,
            doctor.availability,
            doctor.languages,
            doctor.certifications,
            doctor.rating,
            doctor.consultationFee,
            doctor.isAvailable
          ]
        );
      }
    }

    // Insert emergency services
    console.log('🚑 Adding emergency services...');
    for (const service of emergencyServices) {
      await client.query(
        `INSERT INTO emergency_services (
          name, type, phone, email, address, city, state,
          coordinates, response_time_avg, specialties, 
          is_24_7, is_active, capacity_info, contact_person, emergency_line
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          ST_SetSRID(ST_MakePoint($8, $9), 4326), 
          $10, $11, $12, true, $13, $14, $15
        ) ON CONFLICT (name, address) DO UPDATE SET
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          coordinates = EXCLUDED.coordinates,
          updated_at = NOW()`,
        [
          service.name,
          service.type,
          service.phone,
          service.email,
          service.address,
          service.city,
          service.state,
          service.lng,
          service.lat,
          service.responseTimeAvg,
          service.specialties,
          service.is24_7,
          service.capacityInfo,
          service.contactPerson,
          service.emergencyLine
        ]
      );
    }

    // Insert pharmacies
    console.log('💊 Adding pharmacies...');
    for (const pharmacy of pharmacies) {
      await client.query(
        `INSERT INTO pharmacies (
          name, address, city, phone, email, delivery_fee, 
          eta_minutes, operating_hours, payment_methods,
          has_insurance_partnership, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (name, address) DO UPDATE SET
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          delivery_fee = EXCLUDED.delivery_fee,
          eta_minutes = EXCLUDED.eta_minutes,
          updated_at = NOW()`,
        [
          pharmacy.name,
          pharmacy.address,
          pharmacy.city,
          pharmacy.phone,
          pharmacy.email,
          pharmacy.deliveryFee,
          pharmacy.etaMinutes,
          pharmacy.operatingHours,
          pharmacy.paymentMethods,
          pharmacy.hasInsurancePartnership
        ]
      );
    }

    // Insert lab facilities
    console.log('🔬 Adding lab facilities...');
    for (const lab of labFacilities) {
      await client.query(
        `INSERT INTO lab_facilities (
          name, address, city, phone, email, service_hours,
          home_collection, processing_time, specialties, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (name, address) DO UPDATE SET
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          updated_at = NOW()`,
        [
          lab.name,
          lab.address,
          lab.city,
          lab.phone,
          lab.email,
          lab.serviceHours,
          lab.homeCollection,
          lab.processingTime,
          lab.specialties
        ]
      );
    }

    // Insert lab tests
    console.log('🧪 Adding lab tests...');
    for (const test of labTests) {
      await client.query(
        `INSERT INTO lab_tests (
          name, category, price, description, preparation_needed,
          processing_time, report_format, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (name) DO UPDATE SET
          price = EXCLUDED.price,
          description = EXCLUDED.description,
          updated_at = NOW()`,
        [
          test.name,
          test.category,
          test.price,
          test.description,
          test.preparationNeeded,
          test.processingTime,
          test.reportFormat
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Database populated successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error populating database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the function and handle errors
populateDatabase()
  .then(() => {
    console.log('🎉 Database setup complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Database population failed:', err);
    process.exit(1);
  });