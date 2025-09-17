-- =============================================
-- TeleTabib Complete Database Setup Script
-- =============================================
-- This script creates all tables and populates them with dummy data
-- Run this script to get a fully functional database

-- Drop existing database if exists and create new one
DROP DATABASE IF EXISTS MedicalApp;
CREATE DATABASE MedicalApp;

-- Connect to the database
\c MedicalApp;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLE CREATION
-- =============================================

-- 1. Users Table (Core user management)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Pakistan',
    postal_code VARCHAR(20),
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin', 'nurse', 'pharmacist')),
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(10),
    allergies TEXT,
    medical_conditions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctors Table (Doctor-specific information)
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    years_of_experience INTEGER DEFAULT 0,
    qualification TEXT,
    hospital_affiliation VARCHAR(255),
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    bio TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_patients INTEGER DEFAULT 0,
    languages_spoken TEXT[],
    awards_certifications TEXT,
    research_publications TEXT,
    social_media_links JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Doctor Availability Table
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    break_start_time TIME,
    break_end_time TIME,
    max_patients_per_slot INTEGER DEFAULT 1,
    slot_duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, day_of_week, start_time)
);

-- 4. Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    appointment_type VARCHAR(50) DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'routine_checkup', 'vaccination', 'surgery')),
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    symptoms TEXT,
    notes TEXT,
    prescription TEXT,
    diagnosis TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    is_video_consultation BOOLEAN DEFAULT FALSE,
    video_session_id UUID,
    reminder_sent BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    patient_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Medical Records Table
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    physical_examination TEXT,
    vital_signs JSONB, -- {"temperature": 98.6, "blood_pressure": "120/80", "pulse": 72, "weight": 70}
    diagnosis TEXT,
    treatment_plan TEXT,
    medications_prescribed TEXT,
    lab_tests_ordered TEXT,
    imaging_studies TEXT,
    follow_up_instructions TEXT,
    doctor_notes TEXT,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Prescriptions Table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    total_medications INTEGER DEFAULT 0,
    pharmacy_id UUID,
    dispensed_by VARCHAR(255),
    dispensed_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Prescription Medications Table
CREATE TABLE prescription_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    instructions TEXT,
    side_effects TEXT,
    contraindications TEXT,
    is_dispensed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Video Sessions Table
CREATE TABLE video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE,
    room_id VARCHAR(255) UNIQUE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'failed')),
    recording_url VARCHAR(255),
    is_recorded BOOLEAN DEFAULT FALSE,
    patient_joined_at TIMESTAMP,
    doctor_joined_at TIMESTAMP,
    connection_quality JSONB,
    technical_issues TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Doctor Reviews Table
CREATE TABLE doctor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    treatment_satisfaction INTEGER CHECK (treatment_satisfaction BETWEEN 1 AND 5),
    would_recommend BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'appointment', 'prescription', 'emergency')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url VARCHAR(255),
    metadata JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Emergency Alerts Table
CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('medical', 'fire', 'police', 'general', 'fall_detected', 'vitals_critical', 'panic')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'responded', 'resolved', 'false_alarm')),
    responded_by UUID REFERENCES users(id),
    response_time INTERVAL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- 12. Emergency Contacts Table
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    can_make_medical_decisions BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Pharmacies Table
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Pakistan',
    postal_code VARCHAR(20),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    is_24_hours BOOLEAN DEFAULT FALSE,
    opening_hours JSONB,
    services_offered TEXT[],
    delivery_available BOOLEAN DEFAULT FALSE,
    online_ordering BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Lab Partners Table
CREATE TABLE lab_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    specializations TEXT[],
    home_collection BOOLEAN DEFAULT FALSE,
    online_reports BOOLEAN DEFAULT FALSE,
    average_report_time_hours INTEGER DEFAULT 24,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Lab Tests Table
CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    lab_partner_id UUID REFERENCES lab_partners(id),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100),
    ordered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sample_collection_date TIMESTAMP,
    report_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ordered' CHECK (status IN ('ordered', 'sample_collected', 'processing', 'completed', 'cancelled')),
    report_url VARCHAR(255),
    results JSONB,
    normal_ranges JSONB,
    doctor_notes TEXT,
    urgent BOOLEAN DEFAULT FALSE,
    cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Insurance Providers Table
CREATE TABLE insurance_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    website VARCHAR(255),
    coverage_types TEXT[],
    network_hospitals TEXT[],
    claim_process TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. User Insurance Table
CREATE TABLE user_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES insurance_providers(id),
    policy_number VARCHAR(255) NOT NULL,
    policy_holder_name VARCHAR(255) NOT NULL,
    relationship_to_patient VARCHAR(100) DEFAULT 'self',
    coverage_start_date DATE,
    coverage_end_date DATE,
    coverage_amount DECIMAL(12,2),
    deductible DECIMAL(10,2) DEFAULT 0.00,
    copay_amount DECIMAL(10,2) DEFAULT 0.00,
    is_primary BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Insurance Claims Table
CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_insurance_id UUID NOT NULL REFERENCES user_insurance(id),
    appointment_id UUID REFERENCES appointments(id),
    claim_number VARCHAR(255) UNIQUE,
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'paid')),
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    payment_date TIMESTAMP,
    rejection_reason TEXT,
    documents TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Patient Vitals Table
CREATE TABLE patient_vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES users(id),
    recorded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,2),
    temperature_celsius DECIMAL(4,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate_bpm INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation DECIMAL(4,2),
    blood_glucose DECIMAL(5,2),
    notes TEXT,
    device_used VARCHAR(255),
    is_self_recorded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Feedback Table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    response TEXT,
    response_date TIMESTAMP,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- DUMMY DATA INSERTION
-- =============================================

-- Insert Admin User
INSERT INTO users (id, email, password, name, phone, role, is_verified, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@teletabib.com', crypt('admin123', gen_salt('bf')), 'TeleTabib Admin', '+923001234567', 'admin', TRUE, TRUE);

-- Insert Patients
INSERT INTO users (id, email, password, name, phone, date_of_birth, gender, address, city, state, country, role, is_verified, emergency_contact_name, emergency_contact_phone, blood_type, allergies, medical_conditions) VALUES
('11111111-1111-1111-1111-111111111111', 'patient1@gmail.com', crypt('password123', gen_salt('bf')), 'Ahmed Ali Khan', '+923001234568', '1985-03-15', 'male', 'House 123, F-7 Markaz', 'Islamabad', 'ICT', 'Pakistan', 'patient', TRUE, 'Fatima Khan', '+923009876543', 'O+', 'Penicillin allergy', 'Hypertension'),
('22222222-2222-2222-2222-222222222222', 'patient2@gmail.com', crypt('password123', gen_salt('bf')), 'Aisha Mahmood', '+923001234569', '1992-07-22', 'female', 'Flat 45, DHA Phase 2', 'Karachi', 'Sindh', 'Pakistan', 'patient', TRUE, 'Mohammed Mahmood', '+923019876543', 'A+', 'No known allergies', NULL),
('33333333-3333-3333-3333-333333333333', 'patient3@gmail.com', crypt('password123', gen_salt('bf')), 'Hassan Raza', '+923001234570', '1978-11-08', 'male', 'Street 15, Model Town', 'Lahore', 'Punjab', 'Pakistan', 'patient', TRUE, 'Khadija Raza', '+923029876543', 'B+', 'Shellfish allergy', 'Diabetes Type 2'),
('44444444-4444-4444-4444-444444444444', 'patient4@gmail.com', crypt('password123', gen_salt('bf')), 'Zara Sheikh', '+923001234571', '1990-05-30', 'female', 'House 78, University Road', 'Peshawar', 'KPK', 'Pakistan', 'patient', TRUE, 'Omar Sheikh', '+923039876543', 'AB+', 'Dust allergy', NULL),
('55555555-5555-5555-5555-555555555555', 'patient5@gmail.com', crypt('password123', gen_salt('bf')), 'Ali Haider', '+923001234572', '1988-12-18', 'male', 'Block C, Johar Town', 'Lahore', 'Punjab', 'Pakistan', 'patient', TRUE, 'Sara Haider', '+923049876543', 'O-', 'No known allergies', 'Asthma');

-- Insert Doctors
INSERT INTO users (id, email, password, name, phone, date_of_birth, gender, address, city, state, country, role, is_verified) VALUES
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.cardiology@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Muhammad Tariq', '+923101234567', '1975-06-12', 'male', 'Agha Khan Hospital, Stadium Road', 'Karachi', 'Sindh', 'Pakistan', 'doctor', TRUE),
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.pediatrics@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Fatima Noor', '+923101234568', '1982-09-25', 'female', 'Shifa Hospital, H-8', 'Islamabad', 'ICT', 'Pakistan', 'doctor', TRUE),
('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.orthopedic@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Usman Ahmed', '+923101234569', '1978-04-18', 'male', 'Mayo Hospital, Jail Road', 'Lahore', 'Punjab', 'Pakistan', 'doctor', TRUE),
('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.dermatology@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Ayesha Malik', '+923101234570', '1985-01-14', 'female', 'CMH Hospital, Mall Road', 'Rawalpindi', 'Punjab', 'Pakistan', 'doctor', TRUE),
('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.neurology@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Kashif Shah', '+923101234571', '1980-11-03', 'male', 'Lady Reading Hospital', 'Peshawar', 'KPK', 'Pakistan', 'doctor', TRUE);

-- Insert Doctor Details
INSERT INTO doctors (id, user_id, license_number, specialization, years_of_experience, qualification, hospital_affiliation, consultation_fee, bio, is_verified, rating, total_reviews, languages_spoken) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-12345', 'Cardiology', 15, 'MBBS, MD Cardiology, FCPS', 'Agha Khan University Hospital', 3000.00, 'Experienced cardiologist specializing in heart diseases and cardiac surgery', TRUE, 4.8, 150, ARRAY['English', 'Urdu', 'Sindhi']),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-23456', 'Pediatrics', 12, 'MBBS, DCH, FCPS Pediatrics', 'Shifa International Hospital', 2500.00, 'Dedicated pediatrician with expertise in child healthcare and development', TRUE, 4.9, 200, ARRAY['English', 'Urdu']),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-34567', 'Orthopedic Surgery', 18, 'MBBS, MS Orthopedics, FRCS', 'Mayo Hospital Lahore', 3500.00, 'Senior orthopedic surgeon specializing in joint replacement and sports injuries', TRUE, 4.7, 120, ARRAY['English', 'Urdu', 'Punjabi']),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-45678', 'Dermatology', 8, 'MBBS, FCPS Dermatology', 'Combined Military Hospital', 2000.00, 'Dermatologist focusing on skin conditions, cosmetic procedures, and hair treatments', TRUE, 4.6, 95, ARRAY['English', 'Urdu']),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-56789', 'Neurology', 10, 'MBBS, FCPS Neurology, Fellowship', 'Lady Reading Hospital', 4000.00, 'Neurologist specializing in brain and nervous system disorders', TRUE, 4.5, 80, ARRAY['English', 'Urdu', 'Pashto']);

-- Insert Doctor Availability
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
-- Dr. Muhammad Tariq (Cardiology) - Mon to Sat
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '09:00', '17:00', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, '09:00', '17:00', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '09:00', '17:00', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, '09:00', '17:00', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '09:00', '17:00', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 6, '09:00', '13:00', 30),

-- Dr. Fatima Noor (Pediatrics) - Mon to Fri
('cccccccc-cccc-cccc-cccc-cccccccccccc', 1, '08:00', '16:00', 20),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 2, '08:00', '16:00', 20),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, '08:00', '16:00', 20),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 4, '08:00', '16:00', 20),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 5, '08:00', '16:00', 20),

-- Dr. Usman Ahmed (Orthopedic) - Tue, Thu, Sat
('dddddddd-dddd-dddd-dddd-dddddddddddd', 2, '10:00', '18:00', 45),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, '10:00', '18:00', 45),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 6, '10:00', '14:00', 45),

-- Dr. Ayesha Malik (Dermatology) - Mon, Wed, Fri
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, '11:00', '19:00', 25),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3, '11:00', '19:00', 25),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, '11:00', '19:00', 25),

-- Dr. Kashif Shah (Neurology) - Mon to Thu
('ffffffff-ffff-ffff-ffff-ffffffffffff', 1, '14:00', '20:00', 60),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 2, '14:00', '20:00', 60),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 3, '14:00', '20:00', 60),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 4, '14:00', '20:00', 60);

-- Insert Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, consultation_fee, symptoms, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-09-15', '10:00', 'scheduled', 'consultation', 3000.00, 'Chest pain and shortness of breath', 'Patient reports symptoms for 3 days'),
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-09-15', '14:20', 'confirmed', 'routine_checkup', 2500.00, 'Regular pediatric checkup for 3-year-old', 'Vaccination due'),
('33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2025-09-16', '15:30', 'scheduled', 'consultation', 3500.00, 'Knee pain after sports injury', 'Pain worsened over past week'),
('44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2025-09-17', '16:45', 'scheduled', 'consultation', 2000.00, 'Acne and skin rash', 'Recurring issue for 2 months'),
('55555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2025-09-18', '16:00', 'scheduled', 'follow_up', 4000.00, 'Follow-up for migraine treatment', 'Previous treatment response evaluation');

-- Insert Medical Records
INSERT INTO medical_records (patient_id, doctor_id, record_date, chief_complaint, diagnosis, vital_signs, treatment_plan) VALUES
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-09-10', 'Chest pain and fatigue', 'Mild hypertension, stress-related chest discomfort', 
'{"temperature": 98.4, "blood_pressure": "140/90", "pulse": 85, "weight": 78.5}',
'Prescribed antihypertensive medication, stress management, regular exercise'),

('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-09-08', 'Diabetic follow-up', 'Type 2 Diabetes Mellitus - controlled', 
'{"temperature": 98.6, "blood_pressure": "130/85", "pulse": 72, "weight": 82.3, "blood_glucose": 145}',
'Continue metformin, dietary counseling, HbA1c in 3 months');

-- Insert Prescriptions
INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id) VALUES
('pres0001-0001-0001-0001-000000000001', (SELECT id FROM appointments WHERE patient_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111');

-- Insert Prescription Medications
INSERT INTO prescription_medications (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions) VALUES
('pres0001-0001-0001-0001-000000000001', 'Amlodipine', '5mg', 'Once daily', '30 days', 30, 'Take in morning with breakfast'),
('pres0001-0001-0001-0001-000000000001', 'Aspirin', '75mg', 'Once daily', '30 days', 30, 'Take after dinner');

-- Insert Doctor Reviews
INSERT INTO doctor_reviews (doctor_id, patient_id, rating, review_text, communication_rating, punctuality_rating, treatment_satisfaction, would_recommend) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 5, 'Excellent doctor, very thorough examination and clear explanation of condition', 5, 5, 5, TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 5, 'Great with children, very patient and caring', 5, 5, 5, TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 4, 'Good treatment for my knee injury, recovery going well', 4, 5, 4, TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 4, 'Helpful advice for skin care, treatment working', 4, 4, 4, TRUE);

-- Insert Notifications
INSERT INTO notifications (user_id, title, message, type, priority) VALUES
('11111111-1111-1111-1111-111111111111', 'Appointment Reminder', 'Your appointment with Dr. Muhammad Tariq is tomorrow at 10:00 AM', 'appointment', 'high'),
('22222222-2222-2222-2222-222222222222', 'Vaccination Due', 'Your child is due for routine vaccination. Please schedule an appointment.', 'info', 'normal'),
('33333333-3333-3333-3333-333333333333', 'Lab Results Ready', 'Your blood test results are now available. Please check your medical records.', 'info', 'normal');

-- Insert Emergency Contacts
INSERT INTO emergency_contacts (user_id, contact_name, relationship, phone, email, is_primary) VALUES
('11111111-1111-1111-1111-111111111111', 'Fatima Khan', 'Wife', '+923009876543', 'fatima.khan@gmail.com', TRUE),
('22222222-2222-2222-2222-222222222222', 'Mohammed Mahmood', 'Father', '+923019876543', 'mohammed.mahmood@gmail.com', TRUE),
('33333333-3333-3333-3333-333333333333', 'Khadija Raza', 'Wife', '+923029876543', 'khadija.raza@gmail.com', TRUE);

-- Insert Pharmacies
INSERT INTO pharmacies (name, address, city, state, phone, email, is_24_hours, delivery_available, rating) VALUES
('MediCare Pharmacy', 'F-7 Markaz, Shop 12', 'Islamabad', 'ICT', '+925551234567', 'info@medicare.pk', TRUE, TRUE, 4.5),
('CityMed Pharmacy', 'Clifton Block 2', 'Karachi', 'Sindh', '+922135551234', 'contact@citymed.pk', FALSE, TRUE, 4.3),
('HealthPlus Pharmacy', 'Mall Road, Near Mayo Hospital', 'Lahore', 'Punjab', '+924235551234', 'support@healthplus.pk', TRUE, FALSE, 4.7);

-- Insert Lab Partners
INSERT INTO lab_partners (name, address, city, state, phone, email, home_collection, online_reports, rating) VALUES
('ChughtaiLab', 'Main Boulevard, Gulberg', 'Lahore', 'Punjab', '+924235556789', 'info@chughtailab.pk', TRUE, TRUE, 4.8),
('Excel Labs', 'F-8 Markaz', 'Islamabad', 'ICT', '+925155556789', 'contact@excellabs.pk', TRUE, TRUE, 4.6),
('Metropole Lab', 'Saddar, Near Civil Hospital', 'Karachi', 'Sindh', '+922135556789', 'info@metropolelab.pk', FALSE, TRUE, 4.4);

-- Insert Lab Tests
INSERT INTO lab_tests (patient_id, doctor_id, lab_partner_id, test_name, test_type, status, cost) VALUES
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM lab_partners WHERE name = 'ChughtaiLab'), 'Complete Blood Count', 'Blood Test', 'completed', 2500.00),
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM lab_partners WHERE name = 'Excel Labs'), 'HbA1c Test', 'Blood Test', 'completed', 3000.00);

-- Insert Insurance Providers
INSERT INTO insurance_providers (name, code, contact_phone, contact_email, is_active) VALUES
('State Life Insurance', 'SLI', '+924235557890', 'claims@statelife.pk', TRUE),
('EFU Life Assurance', 'EFU', '+922135557890', 'support@efu.pk', TRUE),
('Jubilee Life Insurance', 'JLI', '+925155557890', 'service@jubileelife.pk', TRUE);

-- Insert User Insurance
INSERT INTO user_insurance (user_id, provider_id, policy_number, policy_holder_name, coverage_amount, is_primary) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM insurance_providers WHERE code = 'SLI'), 'SLI-123456789', 'Ahmed Ali Khan', 500000.00, TRUE),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM insurance_providers WHERE code = 'EFU'), 'EFU-987654321', 'Aisha Mahmood', 300000.00, TRUE);

-- Insert Patient Vitals
INSERT INTO patient_vitals (patient_id, weight_kg, height_cm, bmi, temperature_celsius, blood_pressure_systolic, blood_pressure_diastolic, heart_rate_bpm) VALUES
('11111111-1111-1111-1111-111111111111', 78.5, 175.0, 25.6, 98.4, 140, 90, 85),
('22222222-2222-2222-2222-222222222222', 60.2, 165.0, 22.1, 98.6, 120, 80, 72),
('33333333-3333-3333-3333-333333333333', 82.3, 172.0, 27.8, 98.6, 130, 85, 72);

-- Insert Feedback
INSERT INTO feedback (user_id, category, subject, message, rating, status) VALUES
('11111111-1111-1111-1111-111111111111', 'App Functionality', 'Easy to use interface', 'The app is very user-friendly and booking appointments is straightforward', 5, 'resolved'),
('22222222-2222-2222-2222-222222222222', 'Doctor Service', 'Great pediatrician', 'Dr. Fatima was excellent with my child, very professional', 5, 'resolved'),
('33333333-3333-3333-3333-333333333333', 'Technical Issue', 'Video call quality', 'Sometimes the video call connection is unstable', 3, 'in_progress');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Update sequences and final touches
UPDATE doctors SET rating = (
    SELECT COALESCE(AVG(rating::DECIMAL), 0)
    FROM doctor_reviews 
    WHERE doctor_reviews.doctor_id = doctors.id
);

UPDATE doctors SET total_reviews = (
    SELECT COUNT(*)
    FROM doctor_reviews 
    WHERE doctor_reviews.doctor_id = doctors.id
);

-- Add some emergency alerts for testing
INSERT INTO emergency_alerts (patient_id, alert_type, severity, location, description, status) VALUES
('11111111-1111-1111-1111-111111111111', 'medical', 'high', 'F-7 Markaz, Islamabad', 'Patient experiencing severe chest pain', 'active'),
('33333333-3333-3333-3333-333333333333', 'vitals_critical', 'critical', 'Model Town, Lahore', 'Blood pressure critically high - 180/120', 'responded');

COMMIT;

-- Display success message
SELECT 'TeleTabib database setup completed successfully!' as message;
SELECT 'Total tables created: ' || COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';