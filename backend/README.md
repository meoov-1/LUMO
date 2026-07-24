# Lumo Backend - Daily Mindful Journaling & AI Career Path App

Production-ready Spring Boot 3 backend with JWT authentication, PostgreSQL database, and Google Gemini AI integration.

## Features

- **User Authentication**: JWT-based authentication with BCrypt password hashing
- **24-Hour Journal Leveling System**: Enforced cooldown period between journal entries
- **30-Day Cycle Tracking**: Automatic level progression from 0 to 30
- **AI Career Path Prediction**: Google Gemini API integration for career analysis after cycle completion
- **Historical Journal Archive**: All journal entries permanently stored and retrievable

## Tech Stack

- Java 17
- Spring Boot 3.2.1
- Spring Security with JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- Google Gemini API (via WebClient)
- Lombok
- Maven

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 14+
- Google Gemini API Key

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE lumo_db;
```

### 2. Environment Variables

Create a `.env` file or set environment variables:

```bash
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-256-bits
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Application Configuration

Update `src/main/resources/application.yml` with your database credentials if not using environment variables.

### 4. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response includes JWT token:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "user@example.com",
    "fullName": "John Doe",
    "userId": 1
  }
}
```

### User Status

#### Get Current Status
```http
GET /api/user/status
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "message": "User status retrieved",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "currentCycle": 1,
    "currentLevel": 5,
    "lastJournalTimestamp": "2026-07-24T10:30:00Z",
    "timeRemainingUntilNextLevel": 43200,
    "nextAvailableTime": "2026-07-25T10:30:00Z",
    "canJournalNow": false
  }
}
```

### Journal Entries

#### Submit Journal Entry
```http
POST /api/journal/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Today I reflected on my career goals and realized...",
  "moodTag": "motivated",
  "reflectionScore": 8
}
```

**24-Hour Cooldown Enforcement**: Returns HTTP 429 if less than 24 hours have passed since last entry.

Success Response:
```json
{
  "success": true,
  "message": "Journal entry submitted successfully",
  "data": {
    "id": 1,
    "cycle": 1,
    "level": 6,
    "content": "Today I reflected on...",
    "moodTag": "motivated",
    "reflectionScore": 8,
    "createdAt": "2026-07-24T14:30:00Z"
  }
}
```

Error Response (Cooldown):
```json
{
  "success": false,
  "message": "You can only write 1 reflection entry per 24 hours. Please wait until 2026-07-25T10:30:00Z",
  "nextAvailableTime": "2026-07-25T10:30:00Z",
  "secondsRemaining": 43200
}
```

#### Get Journal History
```http
GET /api/journal/history
Authorization: Bearer <jwt_token>

# Optional: Filter by cycle
GET /api/journal/history?cycle=1
```

### Career Predictions

#### Get Latest Career Prediction
```http
GET /api/career/prediction
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "message": "Career prediction retrieved",
  "data": {
    "id": 1,
    "cycle": 1,
    "topCareers": [
      "Software Engineering Manager",
      "Product Manager",
      "Technical Lead"
    ],
    "strengthsSummary": "Strong analytical thinking, excellent communication...",
    "growthRoadmap": "Focus on leadership skills, take on mentorship roles...",
    "fullAnalysis": "Complete AI analysis text...",
    "generatedAt": "2026-07-24T00:00:00Z"
  }
}
```

#### Manually Generate Prediction
```http
POST /api/career/generate/{cycle}
Authorization: Bearer <jwt_token>
```

## Business Logic

### 24-Hour Leveling System

1. User can submit 1 journal entry per 24 hours
2. Each successful submission increments `currentLevel` by 1
3. `lastJournalTimestamp` is updated to current time
4. Attempts before 24 hours return HTTP 429 with remaining time

### 30-Day Cycle Completion

When user completes Level 30:

1. **AI Career Path Synthesis**: Automatically triggered
   - Fetches all 30 journal entries for the completed cycle
   - Sends concatenated reflections to Google Gemini API
   - Parses and stores career prediction in database

2. **Cycle Reset**:
   - `currentLevel` resets to 0
   - `currentCycle` increments by 1
   - **Historical journals are preserved** (never deleted)

3. User can continue journaling in new cycle

### Google Gemini AI Integration

The system uses Gemini 1.5 Flash model to analyze 30 days of reflections:

**Analysis Includes**:
- Top 3 Recommended Career Paths
- Core Strengths & Values
- 30-Day Growth Synthesis
- Actionable Next Steps & Skill Growth Roadmap

## Database Schema

### Users Table
```sql
id                    BIGSERIAL PRIMARY KEY
email                 VARCHAR(100) UNIQUE NOT NULL
password              VARCHAR(255) NOT NULL
full_name             VARCHAR(100) NOT NULL
current_cycle         INTEGER DEFAULT 1
current_level         INTEGER DEFAULT 0
last_journal_timestamp TIMESTAMP
created_at            TIMESTAMP NOT NULL
updated_at            TIMESTAMP NOT NULL
```

### Journal Entries Table
```sql
id                 BIGSERIAL PRIMARY KEY
user_id            BIGINT NOT NULL REFERENCES users(id)
cycle              INTEGER NOT NULL
level              INTEGER NOT NULL
content            TEXT NOT NULL
mood_tag           VARCHAR(50)
reflection_score   INTEGER
created_at         TIMESTAMP NOT NULL
```

### Career Predictions Table
```sql
id                  BIGSERIAL PRIMARY KEY
user_id             BIGINT NOT NULL REFERENCES users(id)
cycle               INTEGER NOT NULL
top_careers         JSONB
strengths_summary   TEXT
growth_roadmap      TEXT
full_analysis       TEXT
generated_at        TIMESTAMP NOT NULL
```

## Security

- **Password Hashing**: BCrypt with default strength (10 rounds)
- **JWT Tokens**: HS256 algorithm, 24-hour expiration
- **CORS**: Configured for localhost:5173 and localhost:3000
- **Session Management**: Stateless (no server-side sessions)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `409` - Conflict (duplicate email)
- `429` - Too Many Requests (cooldown violation)
- `500` - Internal Server Error

## Testing

Run tests:
```bash
mvn test
```

## Production Deployment

1. Update `JWT_SECRET` to a secure random string (minimum 256 bits)
2. Configure production database connection
3. Set `GEMINI_API_KEY` to your production key
4. Update CORS origins in `SecurityConfig.java`
5. Set `spring.jpa.hibernate.ddl-auto` to `validate` or `none`
6. Enable HTTPS/TLS

## License

MIT License
