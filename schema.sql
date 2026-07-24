-- Lumo App Database Schema for MySQL / XAMPP / MariaDB
-- You can import this file into phpMyAdmin or run via MySQL CLI

CREATE DATABASE IF NOT EXISTS lumo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lumo_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  current_cycle INT DEFAULT 1,
  current_level INT DEFAULT 1,
  last_journal_timestamp DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Journal Entries Table (30-day daily reflections)
CREATE TABLE IF NOT EXISTS journal_entries (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  cycle INT DEFAULT 1,
  level INT NOT NULL,
  content TEXT NOT NULL,
  mood_tag VARCHAR(50) DEFAULT 'Calm',
  reflection_score INT DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Career Predictions Table (30-Day Gemini AI Career Syntheses)
CREATE TABLE IF NOT EXISTS career_predictions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  cycle INT DEFAULT 1,
  summary TEXT NOT NULL,
  top_careers JSON NOT NULL,
  strengths_summary JSON NOT NULL,
  growth_roadmap JSON NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Demo Data
INSERT INTO users (id, email, password_hash, full_name, username, current_cycle, current_level, created_at)
VALUES ('user_demo_123', 'explorer@lumo.app', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Explorer', 'explorer_user', 1, 3, NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
