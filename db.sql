-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Applications table 
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    company VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    job_link TEXT,
    date_applied DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'applied',
    applied_note TEXT,
    interview_note TEXT,
    offer_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration: run these if the table already exists
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS applied_note TEXT;
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_note TEXT;
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_note TEXT;