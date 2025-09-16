-- =====================================================
-- TELETABIB - EXTENDED DATABASE SCHEMA FOR ALL FEATURES
-- PostgreSQL Schema for Complete Healthcare Platform
-- =====================================================

-- EXISTING TABLES (Already implemented)
-- users, doctors, appointments, doctor_availability, doctor_reviews
-- notifications, feedback, feedback_categories, doctor_ratings

-- =====================================================
-- 1. VIDEO CONSULTATION & CALL SYSTEM
-- =====================================================

-- Video Sessions Table
CREATE TABLE IF NOT EXISTS video_sessions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'connecting', 'active', 'ended', 'failed')),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER, -- in minutes
    recording_url VARCHAR(500),
    recording_consent BOOLEAN DEFAULT FALSE,
    recording_size_mb INTEGER,
    connection_quality VARCHAR(20) DEFAULT 'good',
    participants JSONB, -- Store participant details
    technical_issues TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Queue Management Table
CREATE TABLE IF NOT EXISTS consultation_queue (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    queue_position INTEGER NOT NULL,
    estimated_wait_time INTERVAL,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_session', 'completed', 'cancelled')),
    check_in_time TIMESTAMP DEFAULT NOW(),
    called_time TIMESTAMP,
    session_start_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. DOCTOR VERIFICATION SYSTEM
-- =====================================================

-- Doctor Verification Documents
CREATE TABLE IF NOT EXISTS doctor_verifications (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'license', 'degree', 'certificate', 'id_proof'
    document_number VARCHAR(100),
    issuing_authority VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    document_url VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    medical_council_verified BOOLEAN DEFAULT FALSE,
    council_registration_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Peer Reviews (Doctor to Doctor)
CREATE TABLE IF NOT EXISTS peer_reviews (
    id SERIAL PRIMARY KEY,
    reviewing_doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    reviewed_doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    professional_competence INTEGER CHECK (professional_competence BETWEEN 1 AND 5),
    communication_skills INTEGER CHECK (communication_skills BETWEEN 1 AND 5),
    reliability INTEGER CHECK (reliability BETWEEN 1 AND 5),
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    comments TEXT,
    recommendation VARCHAR(20) CHECK (recommendation IN ('highly_recommend', 'recommend', 'neutral', 'not_recommend')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(reviewing_doctor_id, reviewed_doctor_id)
);

-- =====================================================
-- 3. DIGITAL PRESCRIPTIONS & E-SIGNATURE
-- =====================================================

-- Digital Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    prescription_number VARCHAR(50) UNIQUE NOT NULL,
    diagnosis TEXT,
    instructions TEXT,
    follow_up_date DATE,
    prescription_data JSONB, -- Store complete prescription in JSON
    digital_signature TEXT, -- Base64 encoded signature
    qr_code_data TEXT,
    qr_code_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'cancelled', 'expired')),
    expires_at TIMESTAMP,
    pharmacy_filled_at TIMESTAMP,
    filled_by VARCHAR(200), -- Pharmacy name
    created_at TIMESTAMP DEFAULT NOW()
);

-- Prescription Medications
CREATE TABLE IF NOT EXISTS prescription_medications (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity INTEGER,
    instructions TEXT,
    drug_interaction_warnings TEXT,
    side_effects TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. VITALS MONITORING & SENSOR DATA
-- =====================================================

-- Patient Vitals
CREATE TABLE IF NOT EXISTS patient_vitals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vital_type VARCHAR(50) NOT NULL, -- 'heart_rate', 'blood_pressure', 'temperature', 'oxygen_saturation', 'weight', 'blood_sugar'
    value_numeric DECIMAL(10,2),
    value_text VARCHAR(100),
    unit VARCHAR(20),
    source VARCHAR(50), -- 'manual', 'smartwatch', 'fitbit', 'hospital', 'home_device'
    device_id VARCHAR(100),
    measurement_time TIMESTAMP NOT NULL,
    threshold_status VARCHAR(20) DEFAULT 'normal' CHECK (threshold_status IN ('low', 'normal', 'high', 'critical')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Wearable Device Integrations
CREATE TABLE IF NOT EXISTS wearable_devices (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL, -- 'fitbit', 'apple_watch', 'samsung_health', 'oura'
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP,
    api_credentials TEXT, -- Encrypted credentials
    sync_frequency INTEGER DEFAULT 15, -- minutes
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vital Thresholds & Alerts
CREATE TABLE IF NOT EXISTS vital_thresholds (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    vital_type VARCHAR(50) NOT NULL,
    min_normal DECIMAL(10,2),
    max_normal DECIMAL(10,2),
    min_critical DECIMAL(10,2),
    max_critical DECIMAL(10,2),
    alert_enabled BOOLEAN DEFAULT TRUE,
    alert_contacts JSONB, -- Emergency contacts to notify
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(patient_id, vital_type)
);

-- =====================================================
-- 5. AI CHATBOT SYSTEM
-- =====================================================

-- Chatbot Conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100) NOT NULL,
    conversation_type VARCHAR(50) DEFAULT 'general', -- 'symptom_check', 'booking', 'faq', 'triage'
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'escalated')),
    escalated_to_human BOOLEAN DEFAULT FALSE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chatbot Messages
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot')),
    message_text TEXT,
    message_type VARCHAR(30) DEFAULT 'text', -- 'text', 'quick_reply', 'card', 'image', 'audio'
    intent VARCHAR(100),
    confidence DECIMAL(3,2),
    entities JSONB, -- Extracted entities from message
    response_time INTEGER, -- milliseconds
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. E-PHARMACY & MEDICINE DELIVERY
-- =====================================================

-- Pharmacy Partners
CREATE TABLE IF NOT EXISTS pharmacies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_24_hour BOOLEAN DEFAULT FALSE,
    delivery_available BOOLEAN DEFAULT FALSE,
    delivery_radius INTEGER, -- in kilometers
    rating DECIMAL(3,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Medicine Inventory
CREATE TABLE IF NOT EXISTS medicine_inventory (
    id SERIAL PRIMARY KEY,
    pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    manufacturer VARCHAR(200),
    batch_number VARCHAR(100),
    expiry_date DATE,
    quantity_available INTEGER,
    price DECIMAL(10,2),
    prescription_required BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Medicine Orders
CREATE TABLE IF NOT EXISTS medicine_orders (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
    prescription_id INTEGER REFERENCES prescriptions(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2),
    delivery_address TEXT,
    delivery_type VARCHAR(20) DEFAULT 'standard', -- 'standard', 'express', 'pickup'
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status VARCHAR(20) DEFAULT 'placed' CHECK (order_status IN ('placed', 'confirmed', 'prepared', 'shipped', 'delivered', 'cancelled')),
    delivery_tracking_id VARCHAR(100),
    estimated_delivery TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Medicine Order Items
CREATE TABLE IF NOT EXISTS medicine_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES medicine_orders(id) ON DELETE CASCADE,
    medicine_name VARCHAR(200),
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
);

-- =====================================================
-- 7. LAB REPORTS & MEDICAL RECORDS
-- =====================================================

-- Lab Partners
CREATE TABLE IF NOT EXISTS lab_partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_home_collection BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lab Tests
CREATE TABLE IF NOT EXISTS lab_tests (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    lab_partner_id INTEGER REFERENCES lab_partners(id) ON DELETE SET NULL,
    test_name VARCHAR(200) NOT NULL,
    test_category VARCHAR(100),
    test_date DATE,
    sample_collection_date DATE,
    report_date DATE,
    report_url VARCHAR(500),
    report_data JSONB, -- Store structured lab results
    reference_ranges JSONB,
    abnormal_flags JSONB,
    doctor_comments TEXT,
    patient_notes TEXT,
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'sample_collected', 'processing', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Medical Records Storage
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    record_type VARCHAR(50) NOT NULL, -- 'prescription', 'lab_report', 'imaging', 'consultation_note', 'discharge_summary'
    title VARCHAR(200),
    description TEXT,
    file_url VARCHAR(500),
    file_type VARCHAR(50), -- 'pdf', 'image', 'dicom'
    file_size INTEGER,
    is_encrypted BOOLEAN DEFAULT TRUE,
    encryption_key VARCHAR(255),
    access_permissions JSONB, -- Who can access this record
    tags TEXT[], -- For easy searching
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. MULTI-LANGUAGE SUPPORT
-- =====================================================

-- Language Settings
CREATE TABLE IF NOT EXISTS user_language_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    primary_language VARCHAR(10) DEFAULT 'en',
    secondary_languages VARCHAR(10)[],
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    time_format VARCHAR(10) DEFAULT '12h',
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    rtl_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Translation Strings (for dynamic content)
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    key VARCHAR(200) NOT NULL,
    language VARCHAR(10) NOT NULL,
    value TEXT NOT NULL,
    context VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(key, language)
);

-- =====================================================
-- 9. INSURANCE INTEGRATION
-- =====================================================

-- Insurance Providers
CREATE TABLE IF NOT EXISTS insurance_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    type VARCHAR(50), -- 'health', 'dental', 'vision'
    api_endpoint VARCHAR(300),
    api_credentials TEXT, -- Encrypted
    is_active BOOLEAN DEFAULT TRUE,
    coverage_areas TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Insurance Information
CREATE TABLE IF NOT EXISTS user_insurance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES insurance_providers(id) ON DELETE CASCADE,
    policy_number VARCHAR(100),
    group_number VARCHAR(100),
    subscriber_id VARCHAR(100),
    relationship VARCHAR(20) DEFAULT 'self', -- 'self', 'spouse', 'child', 'dependent'
    effective_date DATE,
    expiry_date DATE,
    copay_primary DECIMAL(10,2),
    copay_specialist DECIMAL(10,2),
    deductible_annual DECIMAL(10,2),
    deductible_remaining DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insurance Claims
CREATE TABLE IF NOT EXISTS insurance_claims (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    user_insurance_id INTEGER REFERENCES user_insurance(id) ON DELETE CASCADE,
    claim_number VARCHAR(100) UNIQUE,
    service_date DATE,
    billed_amount DECIMAL(10,2),
    covered_amount DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'approved', 'denied', 'paid')),
    denial_reason TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 10. EMERGENCY SYSTEM
-- =====================================================

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    can_make_medical_decisions BOOLEAN DEFAULT FALSE,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Emergency Alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'panic_button', 'vital_critical', 'fall_detection', 'medication_missed'
    severity VARCHAR(20) DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location_data JSONB, -- GPS coordinates, address
    vital_data JSONB, -- If triggered by vitals
    alert_message TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm')),
    response_time INTEGER, -- seconds to acknowledgment
    responder_id INTEGER REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Hospital/Ambulance Integration
CREATE TABLE IF NOT EXISTS emergency_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'hospital', 'ambulance', 'fire_dept', 'police'
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    coordinates POINT, -- PostGIS point for location
    service_area POLYGON, -- Service coverage area
    response_time_avg INTEGER, -- minutes
    is_24_hour BOOLEAN DEFAULT TRUE,
    specialties TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 11. DATA PRIVACY & COMPLIANCE
-- =====================================================

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    request_data JSONB,
    response_status INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    compliance_category VARCHAR(50) -- 'hipaa', 'gdpr', 'security'
);

-- Data Access Permissions
CREATE TABLE IF NOT EXISTS data_access_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('read', 'write', 'delete', 'share')),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Data Encryption Keys
CREATE TABLE IF NOT EXISTS encryption_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    key_type VARCHAR(50) NOT NULL, -- 'record_encryption', 'file_encryption', 'communication'
    public_key TEXT,
    private_key_hash VARCHAR(255), -- Never store actual private key
    algorithm VARCHAR(50) DEFAULT 'RSA-2048',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Video Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_video_sessions_appointment ON video_sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_sessions_start_time ON video_sessions(start_time);

-- Queue Management Indexes
CREATE INDEX IF NOT EXISTS idx_consultation_queue_doctor ON consultation_queue(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_queue_patient ON consultation_queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_queue_status ON consultation_queue(status);
CREATE INDEX IF NOT EXISTS idx_consultation_queue_position ON consultation_queue(queue_position);

-- Prescriptions Indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_number ON prescriptions(prescription_number);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- Vitals Indexes
CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient_type ON patient_vitals(patient_id, vital_type);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_time ON patient_vitals(measurement_time);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_threshold ON patient_vitals(threshold_status);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Doctor Dashboard View
CREATE OR REPLACE VIEW doctor_dashboard AS
SELECT 
    d.id as doctor_id,
    u.name as doctor_name,
    d.specialty,
    d.rating,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'scheduled' THEN a.id END) as upcoming_appointments,
    COUNT(DISTINCT cq.id) as patients_in_queue,
    AVG(CASE WHEN vs.duration IS NOT NULL THEN vs.duration END) as avg_consultation_time
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN consultation_queue cq ON d.id = cq.doctor_id AND cq.status = 'waiting'
LEFT JOIN video_sessions vs ON a.id = vs.appointment_id
GROUP BY d.id, u.name, d.specialty, d.rating;

-- Patient Health Summary View
CREATE OR REPLACE VIEW patient_health_summary AS
SELECT 
    u.id as patient_id,
    u.name as patient_name,
    COUNT(DISTINCT a.id) as total_consultations,
    COUNT(DISTINCT p.id) as total_prescriptions,
    COUNT(DISTINCT lt.id) as total_lab_tests,
    MAX(pv.measurement_time) as last_vital_check,
    COUNT(CASE WHEN pv.threshold_status = 'critical' THEN 1 END) as critical_vitals_count
FROM users u
LEFT JOIN appointments a ON u.id = a.patient_id
LEFT JOIN prescriptions p ON u.id = p.patient_id
LEFT JOIN lab_tests lt ON u.id = lt.patient_id
LEFT JOIN patient_vitals pv ON u.id = pv.patient_id
WHERE u.id IN (SELECT DISTINCT patient_id FROM appointments)
GROUP BY u.id, u.name;

-- =====================================================
-- TRIGGERS FOR DATA CONSISTENCY
-- =====================================================

-- Update doctor rating when new review is added
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE doctors 
    SET rating = (
        SELECT ROUND(AVG(rating::numeric), 2)
        FROM doctor_reviews 
        WHERE doctor_id = NEW.doctor_id
    )
    WHERE id = NEW.doctor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_doctor_rating
    AFTER INSERT OR UPDATE ON doctor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_rating();

-- Auto-update queue positions when appointment is cancelled
CREATE OR REPLACE FUNCTION reorder_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE consultation_queue 
    SET queue_position = queue_position - 1
    WHERE doctor_id = OLD.doctor_id 
    AND queue_position > OLD.queue_position
    AND status = 'waiting';
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reorder_queue
    AFTER DELETE ON consultation_queue
    FOR EACH ROW
    EXECUTE FUNCTION reorder_queue_positions();