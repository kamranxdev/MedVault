-- ==============================================================================
-- MedVault EHR Database Schema Script (DDL)
-- Compatible with Database SQL Editors (H2, PostgreSQL, MySQL, Oracle, etc.)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_code VARCHAR(255) UNIQUE NOT NULL,
    ssn VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(255),
    blood_type VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    address VARCHAR(255),
    emergency_contact VARCHAR(255),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(255),
    insurance_group_number VARCHAR(255),
    coverage_plan VARCHAR(255),
    medical_alerts VARCHAR(1000),
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS encounters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    attending_provider_id BIGINT NOT NULL,
    encounter_type VARCHAR(255) NOT NULL,
    chief_complaint VARCHAR(1000),
    clinical_notes VARCHAR(3000),
    discharge_summary VARCHAR(3000),
    status VARCHAR(255) DEFAULT 'ACTIVE',
    encounter_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (attending_provider_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS allergies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    allergen_name VARCHAR(255) NOT NULL,
    allergen_code VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    severity VARCHAR(255) NOT NULL,
    reaction_description VARCHAR(1000),
    status VARCHAR(255) DEFAULT 'ACTIVE',
    recorded_by_id BIGINT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS diagnoses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(255),
    snomed_code VARCHAR(255),
    onset_date DATE,
    status VARCHAR(255) DEFAULT 'ACTIVE',
    notes VARCHAR(2000),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    icd_code VARCHAR(255),
    symptoms VARCHAR(2000),
    treatment_plan VARCHAR(2000),
    notes VARCHAR(2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    recorded_by_id BIGINT NOT NULL,
    blood_pressure VARCHAR(255),
    heart_rate INT,
    temperature DOUBLE PRECISION,
    oxygen_saturation INT,
    respiratory_rate INT,
    weight_kg DOUBLE PRECISION,
    height_cm DOUBLE PRECISION,
    bmi DOUBLE PRECISION,
    blood_glucose INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    rx_norm_code VARCHAR(255),
    dosage VARCHAR(255) NOT NULL,
    route VARCHAR(255),
    frequency VARCHAR(255) NOT NULL,
    duration_days INT,
    refills INT DEFAULT 0,
    instructions VARCHAR(1000),
    status VARCHAR(255) DEFAULT 'ACTIVE',
    prescribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(255) DEFAULT 'SCHEDULED',
    reason VARCHAR(255),
    notes VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    user_role VARCHAR(255),
    action VARCHAR(255),
    entity_name VARCHAR(255),
    resource_id VARCHAR(255),
    ip_address VARCHAR(255) DEFAULT '127.0.0.1',
    details VARCHAR(2000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
