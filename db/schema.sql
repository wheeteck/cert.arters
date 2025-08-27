-- Students table (comprehensive)
CREATE TABLE students (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(50),
  registration_date DATE,
  student_type VARCHAR(20) DEFAULT 'individual', -- individual, corporate
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  preferred_learning_mode VARCHAR(20), -- online, face-to-face, hybrid
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  interested_categories TEXT[], -- Array of category interests
  communication_preferences JSONB -- Email, SMS, WhatsApp preferences
);

-- Courses table
CREATE TABLE courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  short_description TEXT,
  long_description TEXT,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(20) DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
  language VARCHAR(20) DEFAULT 'English',
  type VARCHAR(20) NOT NULL, -- online, face-to-face, hybrid
  duration_hours INTEGER NOT NULL,
  duration_weeks INTEGER,
  format VARCHAR(50) DEFAULT 'self-paced', -- self-paced, instructor-led, cohort-based
  max_students INTEGER, -- NULL for unlimited
  prerequisites TEXT[], -- Array of prerequisite descriptions
  skills_covered TEXT[], -- Array of skills/topics
  certificate_template VARCHAR(100) DEFAULT 'standard',
  certificate_title VARCHAR(255),
  ceu_credits DECIMAL(4,2), -- Continuing Education Units
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'SGD',
  active BOOLEAN DEFAULT TRUE,
  enrollment_open BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL
);

-- Student course enrollments
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id),
  course_id VARCHAR(50) REFERENCES courses(id),
  enrollment_date DATE,
  completion_date DATE,
  grade VARCHAR(10),
  score INTEGER, -- 0-100
  status VARCHAR(20) DEFAULT 'enrolled', -- enrolled, in_progress, completed, dropped
  learning_mode VARCHAR(20), -- actual mode taken (may differ from student preference)
  enrollment_source VARCHAR(50), -- website, workshop, referral, etc.
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
  discount_applied DECIMAL(5,2), -- Percentage discount
  instructor_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batches table
CREATE TABLE batches (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(30), -- 'weekly_online', 'monthly_workshop', 'express'
  status VARCHAR(20) DEFAULT 'pending_review', -- pending_review, approved, processing, completed
  certificates_count INTEGER,
  estimated_cost DECIMAL(10,4),
  actual_cost DECIMAL(10,4),
  bitcoin_fee_rate INTEGER, -- satoshis per byte
  blockchain_tx_id VARCHAR(100),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  approved_by VARCHAR(255) -- admin user who approved
);

-- Certificates table
CREATE TABLE certificates (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id),
  enrollment_id INTEGER REFERENCES enrollments(id),
  batch_id VARCHAR(50) REFERENCES batches(id),
  course_id VARCHAR(50) REFERENCES courses(id),
  completion_date DATE,
  issue_date TIMESTAMP,
  grade VARCHAR(10),
  score INTEGER,
  blockchain_tx_id VARCHAR(100),
  blockchain_confirmed BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  ipfs_hash VARCHAR(100),
  pdf_file_path VARCHAR(500),
  verification_count INTEGER DEFAULT 0, -- track how often verified
  last_verified TIMESTAMP,
  status VARCHAR(20) DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificate confirmations table
CREATE TABLE certificate_confirmations (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  student_id VARCHAR(50) REFERENCES students(id),
  course_id VARCHAR(50) REFERENCES courses(id),
  enrollment_id INTEGER REFERENCES enrollments(id),

  -- Original webhook data
  original_student_name VARCHAR(255) NOT NULL,
  original_student_email VARCHAR(255) NOT NULL,
  original_course_title VARCHAR(255) NOT NULL,
  completion_date DATE NOT NULL,
  grade VARCHAR(10),
  score INTEGER,

  -- Confirmation process
  confirmation_token VARCHAR(100) UNIQUE NOT NULL,
  confirmation_email_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmation_deadline TIMESTAMP NOT NULL, -- 24 hours from creation

  -- Student response
  student_response JSONB, -- Store complete response
  confirmed_at TIMESTAMP,
  declined_at TIMESTAMP,
  expired_at TIMESTAMP,

  -- Corrections if provided
  corrected_name VARCHAR(255),
  corrected_email VARCHAR(255),
  correction_reason TEXT,

  -- Status tracking
  status VARCHAR(30) DEFAULT 'pending', -- pending, confirmed, declined, expired, corrected
  wants_certificate BOOLEAN,
  ready_for_batch BOOLEAN DEFAULT FALSE,

  -- Technical details
  response_ip VARCHAR(45),
  response_user_agent TEXT,
  reminder_sent_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook logs table
CREATE TABLE webhook_logs (
  id SERIAL PRIMARY KEY,
  payload TEXT,
  batch_id VARCHAR(50),
  certificate_ids TEXT, -- JSON array of cert IDs
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  source_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
  two_factor_secret VARCHAR(32),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
