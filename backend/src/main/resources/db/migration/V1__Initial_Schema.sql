-- Initial schema for Lumo Backend
-- PostgreSQL Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    current_cycle INTEGER DEFAULT 1 NOT NULL,
    current_level INTEGER DEFAULT 0 NOT NULL,
    last_journal_timestamp TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cycle INTEGER NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 30),
    content TEXT NOT NULL,
    mood_tag VARCHAR(50),
    reflection_score INTEGER CHECK (reflection_score >= 1 AND reflection_score <= 10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_journal_user_cycle ON journal_entries(user_id, cycle);
CREATE INDEX idx_journal_user_created ON journal_entries(user_id, created_at);

-- Career predictions table
CREATE TABLE IF NOT EXISTS career_predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cycle INTEGER NOT NULL,
    top_careers JSONB,
    strengths_summary TEXT,
    growth_roadmap TEXT,
    full_analysis TEXT,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_career_user_cycle ON career_predictions(user_id, cycle);
CREATE INDEX idx_career_generated ON career_predictions(user_id, generated_at DESC);
