-- =============================================
-- Complete Dummy Data Addition Script
-- =============================================
-- Fix prescription data and add comprehensive dummy data

\c medical_booking;

-- Fix Prescriptions with proper UUIDs
INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, total_medications, status) VALUES
((SELECT id FROM appointments WHERE patient_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 2, 'active'),
((SELECT id FROM appointments WHERE patient_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 1, 'active'),
((SELECT id FROM appointments WHERE patient_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 2, 'active');

-- Add Prescription Medications with proper prescription IDs
INSERT INTO prescription_medications (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions) VALUES
((SELECT id FROM prescriptions WHERE patient_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), 'Amlodipine', '5mg', 'Once daily', '30 days', 30, 'Take in morning with breakfast'),
((SELECT id FROM prescriptions WHERE patient_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), 'Aspirin', '75mg', 'Once daily', '30 days', 30, 'Take after dinner'),
((SELECT id FROM prescriptions WHERE patient_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 'Metformin', '500mg', 'Twice daily', '30 days', 60, 'Take with meals'),
((SELECT id FROM prescriptions WHERE patient_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 'Amoxicillin', '250mg', 'Three times daily', '7 days', 21, 'Complete full course'),
((SELECT id FROM prescriptions WHERE patient_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 'Paracetamol', '120mg', 'As needed for fever', '5 days', 10, 'Maximum 4 doses per day');

-- Add More Patients (10 additional patients)
INSERT INTO users (id, email, password, name, phone, date_of_birth, gender, address, city, state, country, role, is_verified, emergency_contact_name, emergency_contact_phone, blood_type, allergies, medical_conditions) VALUES
('66666666-6666-6666-6666-666666666666', 'patient6@gmail.com', crypt('password123', gen_salt('bf')), 'Saira Ahmad', '+923001234573', '1995-02-14', 'female', 'Block B, Gulshan-e-Iqbal', 'Karachi', 'Sindh', 'Pakistan', 'patient', TRUE, 'Tariq Ahmad', '+923059876543', 'A-', 'Latex allergy', NULL),
('77777777-7777-7777-7777-777777777777', 'patient7@gmail.com', crypt('password123', gen_salt('bf')), 'Omar Malik', '+923001234574', '1980-08-25', 'male', 'Phase 3, DHA', 'Lahore', 'Punjab', 'Pakistan', 'patient', TRUE, 'Nadia Malik', '+923069876543', 'B-', 'No known allergies', 'High Cholesterol'),
('88888888-8888-8888-8888-888888888888', 'patient8@gmail.com', crypt('password123', gen_salt('bf')), 'Fatima Siddiqui', '+923001234575', '1987-12-03', 'female', 'Sector G-9', 'Islamabad', 'ICT', 'Pakistan', 'patient', TRUE, 'Ahmad Siddiqui', '+923079876543', 'AB-', 'Peanut allergy', 'Asthma, Migraine'),
('99999999-9999-9999-9999-999999999999', 'patient9@gmail.com', crypt('password123', gen_salt('bf')), 'Bilal Khan', '+923001234576', '1993-04-17', 'male', 'Saddar Town', 'Rawalpindi', 'Punjab', 'Pakistan', 'patient', TRUE, 'Ayesha Khan', '+923089876543', 'O+', 'Shellfish allergy', NULL),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'patient10@gmail.com', crypt('password123', gen_salt('bf')), 'Hina Ashraf', '+923001234577', '1991-06-28', 'female', 'Cantt Area', 'Multan', 'Punjab', 'Pakistan', 'patient', TRUE, 'Kashif Ashraf', '+923099876543', 'A+', 'Drug allergies', 'Thyroid disorder'),
('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'patient11@gmail.com', crypt('password123', gen_salt('bf')), 'Naveed Ali', '+923001234578', '1983-10-12', 'male', 'University Town', 'Peshawar', 'KPK', 'Pakistan', 'patient', TRUE, 'Rubina Ali', '+923109876543', 'B+', 'No known allergies', 'Diabetes Type 1'),
('cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'patient12@gmail.com', crypt('password123', gen_salt('bf')), 'Mariam Sheikh', '+923001234579', '1989-09-05', 'female', 'North Nazimabad', 'Karachi', 'Sindh', 'Pakistan', 'patient', TRUE, 'Hassan Sheikh', '+923119876543', 'O-', 'Dust mites', 'Eczema'),
('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'patient13@gmail.com', crypt('password123', gen_salt('bf')), 'Imran Hussain', '+923001234580', '1976-01-22', 'male', 'Wapda Town', 'Lahore', 'Punjab', 'Pakistan', 'patient', TRUE, 'Sana Hussain', '+923129876543', 'AB+', 'Penicillin allergy', 'Hypertension, Arthritis'),
('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'patient14@gmail.com', crypt('password123', gen_salt('bf')), 'Rabia Qadir', '+923001234581', '1994-07-11', 'female', 'F-10 Markaz', 'Islamabad', 'ICT', 'Pakistan', 'patient', TRUE, 'Qadir Ali', '+923139876543', 'A-', 'No known allergies', NULL),
('ffffffff-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'patient15@gmail.com', crypt('password123', gen_salt('bf')), 'Shahid Afridi', '+923001234582', '1982-03-19', 'male', 'Hayatabad', 'Peshawar', 'KPK', 'Pakistan', 'patient', TRUE, 'Nadia Afridi', '+923149876543', 'B-', 'Iodine allergy', 'Heart condition');

-- Add More Doctors (5 additional doctors)
INSERT INTO users (id, email, password, name, phone, date_of_birth, gender, address, city, state, country, role, is_verified) VALUES
('aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.psychiatry@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Sarah Ahmed', '+923101234572', '1979-05-20', 'female', 'Ziauddin Hospital', 'Karachi', 'Sindh', 'Pakistan', 'doctor', TRUE),
('aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.gynecology@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Amna Tariq', '+923101234573', '1983-12-08', 'female', 'Fatimid Foundation', 'Islamabad', 'ICT', 'Pakistan', 'doctor', TRUE),
('aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.ent@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Rizwan Shah', '+923101234574', '1981-02-15', 'male', 'Services Hospital', 'Lahore', 'Punjab', 'Pakistan', 'doctor', TRUE),
('aaaaaaa9-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.oncology@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Farah Malik', '+923101234575', '1977-08-30', 'female', 'Shaukat Khanum Hospital', 'Lahore', 'Punjab', 'Pakistan', 'doctor', TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10', 'dr.pulmonology@teletabib.com', crypt('doctor123', gen_salt('bf')), 'Dr. Ahmed Hassan', '+923101234576', '1974-11-12', 'male', 'Hayatabad Medical Complex', 'Peshawar', 'KPK', 'Pakistan', 'doctor', TRUE);

-- Add Doctor Details for new doctors
INSERT INTO doctors (user_id, license_number, specialization, years_of_experience, qualification, hospital_affiliation, consultation_fee, bio, is_verified, rating, total_reviews, languages_spoken) VALUES
('aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-67890', 'Psychiatry', 14, 'MBBS, MRCPsych, FCPS Psychiatry', 'Ziauddin University Hospital', 3500.00, 'Experienced psychiatrist specializing in depression, anxiety, and behavioral disorders', TRUE, 4.4, 75, ARRAY['English', 'Urdu', 'Sindhi']),
('aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-78901', 'Gynecology & Obstetrics', 11, 'MBBS, FCPS Gynecology', 'Fatimid Foundation Hospital', 2800.00, 'Specialist in womens health, pregnancy care, and gynecological procedures', TRUE, 4.7, 180, ARRAY['English', 'Urdu']),
('aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-89012', 'ENT (Otolaryngology)', 13, 'MBBS, MS ENT, FRCS', 'Services Institute of Medical Sciences', 2200.00, 'ENT specialist focusing on ear, nose, throat disorders and head-neck surgery', TRUE, 4.3, 95, ARRAY['English', 'Urdu', 'Punjabi']),
('aaaaaaa9-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PMC-90123', 'Medical Oncology', 16, 'MBBS, FCPS Oncology, Fellowship', 'Shaukat Khanum Memorial Cancer Hospital', 5000.00, 'Medical oncologist with expertise in cancer treatment and chemotherapy', TRUE, 4.9, 220, ARRAY['English', 'Urdu']),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10', 'PMC-01234', 'Pulmonology', 12, 'MBBS, FCPS Medicine, FCPS Pulmonology', 'Hayatabad Medical Complex', 3200.00, 'Pulmonologist specializing in respiratory diseases and critical care', TRUE, 4.5, 110, ARRAY['English', 'Urdu', 'Pashto']);

-- Add More Appointments (15 additional appointments)
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, consultation_fee, symptoms, notes) VALUES
('66666666-6666-6666-6666-666666666666', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '2025-09-16', '11:00', 'scheduled', 'consultation', 3500.00, 'Anxiety and sleep disorders', 'First psychiatric consultation'),
('77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-09-17', '14:30', 'confirmed', 'follow_up', 3000.00, 'Cholesterol management follow-up', 'Review lab results'),
('88888888-8888-8888-8888-888888888888', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '2025-09-18', '10:15', 'scheduled', 'consultation', 2800.00, 'Irregular menstrual cycle', 'PCOS evaluation'),
('99999999-9999-9999-9999-999999999999', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '2025-09-19', '16:20', 'scheduled', 'consultation', 2200.00, 'Chronic sinusitis and hearing issues', 'ENT evaluation needed'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2025-09-20', '12:30', 'confirmed', 'consultation', 2000.00, 'Thyroid-related skin changes', 'Dermatology consultation'),
('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-09-21', '15:00', 'scheduled', 'emergency', 3000.00, 'Diabetic emergency - high blood sugar', 'Urgent consultation needed'),
('cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2025-09-22', '13:45', 'scheduled', 'follow_up', 2000.00, 'Eczema treatment follow-up', 'Treatment response evaluation'),
('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2025-09-23', '11:15', 'confirmed', 'consultation', 3500.00, 'Joint pain and arthritis symptoms', 'Orthopedic evaluation'),
('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-09-24', '09:40', 'scheduled', 'routine_checkup', 2500.00, 'Annual health checkup', 'General health assessment'),
('ffffffff-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-09-25', '10:30', 'scheduled', 'follow_up', 3000.00, 'Heart condition monitoring', 'Cardiac follow-up'),
('66666666-6666-6666-6666-666666666666', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa9-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '2025-09-26', '14:00', 'scheduled', 'consultation', 5000.00, 'Cancer screening consultation', 'Preventive oncology'),
('77777777-7777-7777-7777-777777777777', (SELECT id FROM doctors WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10'), '2025-09-27', '15:30', 'confirmed', 'consultation', 3200.00, 'Chronic cough and breathing issues', 'Pulmonology consultation'),
('88888888-8888-8888-8888-888888888888', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2025-09-28', '17:00', 'scheduled', 'consultation', 4000.00, 'Migraine and headache management', 'Neurology consultation'),
('99999999-9999-9999-9999-999999999999', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-09-29', '08:20', 'scheduled', 'vaccination', 2500.00, 'Adult vaccination - Hepatitis B', 'Vaccination appointment'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '2025-09-30', '16:45', 'scheduled', 'follow_up', 3500.00, 'Thyroid disorder and mood changes', 'Psychiatric evaluation');

-- Add More Medical Records
INSERT INTO medical_records (patient_id, doctor_id, record_date, chief_complaint, diagnosis, vital_signs, treatment_plan) VALUES
('66666666-6666-6666-6666-666666666666', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '2025-09-12', 'Anxiety and panic attacks', 'Generalized Anxiety Disorder', 
'{"temperature": 98.2, "blood_pressure": "125/80", "pulse": 95, "weight": 58.5}',
'Started on SSRI medication, recommended therapy sessions'),

('77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-09-11', 'High cholesterol levels', 'Hyperlipidemia', 
'{"temperature": 98.4, "blood_pressure": "135/88", "pulse": 78, "weight": 85.2, "cholesterol": 245}',
'Prescribed statin therapy, dietary modifications recommended'),

('88888888-8888-8888-8888-888888888888', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '2025-09-09', 'Irregular periods and pelvic pain', 'Polycystic Ovary Syndrome (PCOS)', 
'{"temperature": 98.6, "blood_pressure": "118/75", "pulse": 72, "weight": 65.8}',
'Hormonal therapy initiated, lifestyle counseling provided');

-- Add More Doctor Reviews
INSERT INTO doctor_reviews (doctor_id, patient_id, rating, review_text, communication_rating, punctuality_rating, treatment_satisfaction, would_recommend) VALUES
((SELECT id FROM doctors WHERE user_id = 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '66666666-6666-6666-6666-666666666666', 5, 'Dr. Sarah is an excellent psychiatrist. Very understanding and professional', 5, 5, 5, TRUE),
((SELECT id FROM doctors WHERE user_id = 'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '88888888-8888-8888-8888-888888888888', 5, 'Great gynecologist, very thorough examination and clear explanations', 5, 4, 5, TRUE),
((SELECT id FROM doctors WHERE user_id = 'aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), '99999999-9999-9999-9999-999999999999', 4, 'Good ENT specialist, helped with my sinus problems', 4, 4, 4, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 5, 'Excellent cardiologist, very knowledgeable about heart conditions', 5, 5, 5, TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 4, 'Good dermatologist, treatment for thyroid-related skin issues working well', 4, 4, 4, TRUE);

-- Add More Video Sessions
INSERT INTO video_sessions (appointment_id, session_token, room_id, status, duration_seconds) VALUES
((SELECT id FROM appointments WHERE patient_id = '66666666-6666-6666-6666-666666666666' LIMIT 1), 'vs-token-001', 'room-psychiatry-001', 'completed', 1800),
((SELECT id FROM appointments WHERE patient_id = '77777777-7777-7777-7777-777777777777' LIMIT 1), 'vs-token-002', 'room-cardiology-002', 'completed', 1200),
((SELECT id FROM appointments WHERE patient_id = '88888888-8888-8888-8888-888888888888' LIMIT 1), 'vs-token-003', 'room-gynecology-003', 'scheduled', 0);

-- Add More Notifications for all users
INSERT INTO notifications (user_id, title, message, type, priority) VALUES
('66666666-6666-6666-6666-666666666666', 'Appointment Confirmed', 'Your psychiatric consultation is confirmed for tomorrow at 11:00 AM', 'appointment', 'high'),
('77777777-7777-7777-7777-777777777777', 'Lab Results Available', 'Your cholesterol test results are ready. Please check your medical records.', 'info', 'normal'),
('88888888-8888-8888-8888-888888888888', 'Prescription Ready', 'Your prescription is ready for pickup at MediCare Pharmacy', 'prescription', 'normal'),
('99999999-9999-9999-9999-999999999999', 'Appointment Reminder', 'ENT consultation scheduled for 4:20 PM tomorrow', 'appointment', 'high'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Health Tip', 'Remember to take your thyroid medication at the same time daily', 'info', 'low'),
('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Emergency Alert', 'Your blood sugar levels are critically high. Seek immediate medical attention.', 'emergency', 'urgent'),
('cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Follow-up Due', 'Your eczema follow-up appointment is due next week', 'appointment', 'normal'),
('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Insurance Claim Approved', 'Your recent claim has been approved for Rs. 15,000', 'success', 'normal'),
('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Annual Checkup Due', 'Its time for your annual health checkup', 'info', 'normal'),
('ffffffff-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Medication Refill', 'Your heart medication refill is due in 3 days', 'prescription', 'high');

-- Add More Emergency Contacts
INSERT INTO emergency_contacts (user_id, contact_name, relationship, phone, email, is_primary) VALUES
('66666666-6666-6666-6666-666666666666', 'Tariq Ahmad', 'Husband', '+923059876543', 'tariq.ahmad@gmail.com', TRUE),
('77777777-7777-7777-7777-777777777777', 'Nadia Malik', 'Wife', '+923069876543', 'nadia.malik@gmail.com', TRUE),
('88888888-8888-8888-8888-888888888888', 'Ahmad Siddiqui', 'Father', '+923079876543', 'ahmad.siddiqui@gmail.com', TRUE),
('99999999-9999-9999-9999-999999999999', 'Ayesha Khan', 'Wife', '+923089876543', 'ayesha.khan@gmail.com', TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Kashif Ashraf', 'Husband', '+923099876543', 'kashif.ashraf@gmail.com', TRUE),
('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Rubina Ali', 'Wife', '+923109876543', 'rubina.ali@gmail.com', TRUE),
('cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Hassan Sheikh', 'Husband', '+923119876543', 'hassan.sheikh@gmail.com', TRUE),
('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Sana Hussain', 'Wife', '+923129876543', 'sana.hussain@gmail.com', TRUE),
('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Qadir Ali', 'Father', '+923139876543', 'qadir.ali@gmail.com', TRUE),
('ffffffff-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Nadia Afridi', 'Wife', '+923149876543', 'nadia.afridi@gmail.com', TRUE);

-- Add More Patient Vitals
INSERT INTO patient_vitals (patient_id, weight_kg, height_cm, bmi, temperature_celsius, blood_pressure_systolic, blood_pressure_diastolic, heart_rate_bpm) VALUES
('66666666-6666-6666-6666-666666666666', 58.5, 160.0, 22.8, 98.2, 125, 80, 95),
('77777777-7777-7777-7777-777777777777', 85.2, 178.0, 26.9, 98.4, 135, 88, 78),
('88888888-8888-8888-8888-888888888888', 65.8, 165.0, 24.2, 98.6, 118, 75, 72),
('99999999-9999-9999-9999-999999999999', 73.5, 172.0, 24.9, 98.3, 128, 82, 76),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 62.1, 158.0, 24.9, 98.1, 115, 78, 68),
('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaab', 79.8, 175.0, 26.0, 98.8, 145, 95, 88),
('cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaab', 56.3, 162.0, 21.5, 98.4, 110, 70, 65),
('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaab', 88.7, 170.0, 30.7, 98.5, 150, 98, 92),
('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaaaaab', 59.4, 163.0, 22.4, 98.3, 112, 72, 70),
('ffffffff-aaaa-aaaa-aaaa-aaaaaaaaaaab', 81.2, 176.0, 26.2, 98.7, 138, 90, 85);

-- Add More Lab Tests
INSERT INTO lab_tests (patient_id, doctor_id, lab_partner_id, test_name, test_type, status, cost) VALUES
('77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM lab_partners WHERE name = 'ChughtaiLab'), 'Lipid Profile', 'Blood Test', 'completed', 3500.00),
('88888888-8888-8888-8888-888888888888', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), (SELECT id FROM lab_partners WHERE name = 'Excel Labs'), 'Hormone Panel', 'Blood Test', 'processing', 5000.00),
('99999999-9999-9999-9999-999999999999', (SELECT id FROM doctors WHERE user_id = 'aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), (SELECT id FROM lab_partners WHERE name = 'Metropole Lab'), 'Allergy Panel', 'Blood Test', 'ordered', 4500.00),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', (SELECT id FROM lab_partners WHERE name = 'ChughtaiLab'), 'Thyroid Function Test', 'Blood Test', 'completed', 3000.00),
('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM lab_partners WHERE name = 'Excel Labs'), 'Glucose Tolerance Test', 'Blood Test', 'sample_collected', 2500.00);

-- Add More Insurance Claims
INSERT INTO insurance_claims (user_insurance_id, appointment_id, claim_number, claim_amount, approved_amount, status) VALUES
((SELECT id FROM user_insurance WHERE user_id = '11111111-1111-1111-1111-111111111111'), (SELECT id FROM appointments WHERE patient_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), 'CLM-2025-001', 3000.00, 2500.00, 'approved'),
((SELECT id FROM user_insurance WHERE user_id = '22222222-2222-2222-2222-222222222222'), (SELECT id FROM appointments WHERE patient_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 'CLM-2025-002', 2500.00, 2500.00, 'paid');

-- Add More Feedback
INSERT INTO feedback (user_id, category, subject, message, rating, status) VALUES
('66666666-6666-6666-6666-666666666666', 'Doctor Service', 'Excellent psychiatric care', 'Dr. Sarah Ahmed provided excellent care for my anxiety issues', 5, 'resolved'),
('77777777-7777-7777-7777-777777777777', 'App Performance', 'Slow loading times', 'The app sometimes takes too long to load appointment details', 3, 'in_progress'),
('88888888-8888-8888-8888-888888888888', 'Payment System', 'Payment gateway issue', 'Had trouble processing payment for consultation', 2, 'open'),
('99999999-9999-9999-9999-999999999999', 'Video Call Quality', 'Good video consultation', 'Video call quality was clear during ENT consultation', 4, 'resolved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Prescription Service', 'Quick prescription delivery', 'Prescription was delivered quickly to my address', 5, 'resolved'),
('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Emergency Service', 'Fast emergency response', 'Emergency alert system worked perfectly when needed', 5, 'resolved'),
('cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Lab Integration', 'Seamless lab reports', 'Lab reports are integrated well in the app', 4, 'resolved'),
('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Insurance Claims', 'Claim process smooth', 'Insurance claim process was straightforward', 4, 'resolved');

-- Update doctor ratings based on reviews
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

-- Add some more pharmacy and medicine data
INSERT INTO medicine_inventory (pharmacy_id, medicine_name, generic_name, brand_name, category, price_per_unit, stock_quantity, expiry_date, manufacturer) 
SELECT 
    (SELECT id FROM pharmacies LIMIT 1),
    'Amlodipine 5mg',
    'Amlodipine',
    'Norvasc',
    'Cardiovascular',
    15.00,
    500,
    '2026-12-31',
    'Pfizer'
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medicine_inventory');

-- Final statistics
SELECT 'Database setup completed with comprehensive dummy data!' as message;
SELECT 'Users: ' || COUNT(*) as user_count FROM users;
SELECT 'Doctors: ' || COUNT(*) as doctor_count FROM doctors;
SELECT 'Appointments: ' || COUNT(*) as appointment_count FROM appointments;
SELECT 'Medical Records: ' || COUNT(*) as record_count FROM medical_records;
SELECT 'Reviews: ' || COUNT(*) as review_count FROM doctor_reviews;
SELECT 'Notifications: ' || COUNT(*) as notification_count FROM notifications;