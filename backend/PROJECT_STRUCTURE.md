# Lumo Backend - Project Structure

## Complete Directory Layout

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── lumo/
│   │   │           ├── LumoBackendApplication.java        # Main Spring Boot application entry point
│   │   │           │
│   │   │           ├── config/                             # Configuration classes
│   │   │           │   └── WebClientConfig.java            # WebClient bean for Gemini API
│   │   │           │
│   │   │           ├── controller/                         # REST API Controllers
│   │   │           │   ├── AuthController.java             # /api/auth/* endpoints
│   │   │           │   ├── UserController.java             # /api/user/* endpoints
│   │   │           │   ├── JournalController.java          # /api/journal/* endpoints
│   │   │           │   └── CareerController.java           # /api/career/* endpoints
│   │   │           │
│   │   │           ├── dto/                                # Data Transfer Objects
│   │   │           │   ├── ApiResponse.java                # Generic API response wrapper
│   │   │           │   ├── AuthRequest.java                # Login request DTO
│   │   │           │   ├── AuthResponse.java               # Auth response with JWT
│   │   │           │   ├── RegisterRequest.java            # Registration request DTO
│   │   │           │   ├── UserStatusResponse.java         # User status with level info
│   │   │           │   ├── JournalSubmitRequest.java       # Journal submission request
│   │   │           │   ├── JournalEntryResponse.java       # Journal entry response
│   │   │           │   └── CareerPredictionResponse.java   # Career prediction response
│   │   │           │
│   │   │           ├── entity/                             # JPA Entity classes (Database models)
│   │   │           │   ├── User.java                       # User entity
│   │   │           │   ├── JournalEntry.java               # Journal entry entity
│   │   │           │   └── CareerPrediction.java           # Career prediction entity
│   │   │           │
│   │   │           ├── exception/                          # Custom exceptions
│   │   │           │   ├── DuplicateEmailException.java    # Email already exists error
│   │   │           │   ├── InvalidCredentialsException.java# Wrong password error
│   │   │           │   ├── JournalCooldownException.java   # 24-hour cooldown violation
│   │   │           │   └── GlobalExceptionHandler.java     # Centralized exception handling
│   │   │           │
│   │   │           ├── repository/                         # Spring Data JPA Repositories
│   │   │           │   ├── UserRepository.java             # User database operations
│   │   │           │   ├── JournalEntryRepository.java     # Journal database operations
│   │   │           │   └── CareerPredictionRepository.java # Career prediction database ops
│   │   │           │
│   │   │           ├── security/                           # Security & JWT configuration
│   │   │           │   ├── SecurityConfig.java             # Spring Security configuration
│   │   │           │   ├── JwtUtil.java                    # JWT token generation & validation
│   │   │           │   └── JwtAuthenticationFilter.java    # JWT filter for requests
│   │   │           │
│   │   │           └── service/                            # Business logic layer
│   │   │               ├── AuthService.java                # Authentication logic
│   │   │               ├── UserService.java                # User status management
│   │   │               ├── JournalService.java             # Journal submission & cooldown logic
│   │   │               ├── CareerService.java              # Gemini AI integration
│   │   │               └── CustomUserDetailsService.java   # Spring Security user details
│   │   │
│   │   └── resources/
│   │       ├── application.yml                             # Main configuration
│   │       ├── application-prod.yml                        # Production configuration
│   │       └── db/
│   │           └── migration/
│   │               └── V1__Initial_Schema.sql              # Database schema (optional)
│   │
│   └── test/
│       └── java/
│           └── com/
│               └── lumo/
│                   └── (test classes)
│
├── .gitignore                                               # Git ignore rules
├── .env.example                                             # Environment variables template
├── Dockerfile                                               # Docker image definition
├── docker-compose.yml                                       # Multi-container Docker setup
├── mvnw                                                     # Maven wrapper (Linux/Mac)
├── mvnw.cmd                                                 # Maven wrapper (Windows)
├── pom.xml                                                  # Maven dependencies
├── README.md                                                # Project documentation
├── SETUP_GUIDE.md                                           # Setup instructions
├── API_EXAMPLES.md                                          # API testing examples
└── PROJECT_STRUCTURE.md                                     # This file
```

---

## Component Responsibilities

### 🔐 Security Layer (`security/`)

**SecurityConfig.java**
- Configures Spring Security
- Disables CSRF (using JWT)
- Configures CORS for frontend
- Protects all endpoints except `/api/auth/*`
- Stateless session management

**JwtUtil.java**
- Generates JWT tokens with HS256
- Validates tokens
- Extracts username and claims
- 24-hour token expiration

**JwtAuthenticationFilter.java**
- Intercepts every HTTP request
- Extracts JWT from `Authorization: Bearer` header
- Validates token and sets authentication context

---

### 🎯 Controllers (`controller/`)

**AuthController.java**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**UserController.java**
- `GET /api/user/status` - Get current level, cycle, cooldown status

**JournalController.java**
- `POST /api/journal/submit` - Submit journal entry (enforces 24h cooldown)
- `GET /api/journal/history` - Retrieve past journals (optional cycle filter)

**CareerController.java**
- `GET /api/career/prediction` - Get latest AI career prediction
- `POST /api/career/generate/{cycle}` - Manually trigger prediction

---

### 🧠 Services (`service/`)

**AuthService.java**
- User registration with BCrypt password hashing
- Login with credential validation
- JWT token generation

**UserService.java**
- Fetches user status
- Calculates time remaining until next journal entry

**JournalService.java**
- **24-Hour Cooldown Logic**: Validates timestamp before allowing submission
- Level progression (0 → 30)
- Triggers AI career prediction on level 30
- Cycle reset after level 30
- Historical journal retrieval

**CareerService.java**
- Fetches 30 journal entries for completed cycle
- Constructs AI prompt
- Calls Google Gemini API via WebClient
- Parses JSON response
- Stores prediction in database

**CustomUserDetailsService.java**
- Implements Spring Security `UserDetailsService`
- Loads user by email for authentication

---

### 🗄️ Entities (`entity/`)

**User.java**
- `id` (Primary Key)
- `email` (Unique)
- `password` (BCrypt hashed)
- `fullName`
- `currentCycle` (default 1)
- `currentLevel` (0-30)
- `lastJournalTimestamp`
- `createdAt`, `updatedAt`

**JournalEntry.java**
- `id` (Primary Key)
- `userId` (Foreign Key → User)
- `cycle`
- `level` (1-30)
- `content` (TEXT)
- `moodTag`
- `reflectionScore` (1-10)
- `createdAt`

**CareerPrediction.java**
- `id` (Primary Key)
- `userId` (Foreign Key → User)
- `cycle`
- `topCareers` (JSONB array)
- `strengthsSummary` (TEXT)
- `growthRoadmap` (TEXT)
- `fullAnalysis` (TEXT)
- `generatedAt`

---

### 🗂️ Repositories (`repository/`)

Spring Data JPA interfaces - automatic CRUD operations:

- `UserRepository` - Find by email, check if exists
- `JournalEntryRepository` - Find by user/cycle, count entries
- `CareerPredictionRepository` - Find latest prediction, find by cycle

---

### 📦 DTOs (`dto/`)

Data Transfer Objects for API requests/responses:

- **Requests**: `RegisterRequest`, `AuthRequest`, `JournalSubmitRequest`
- **Responses**: `AuthResponse`, `UserStatusResponse`, `JournalEntryResponse`, `CareerPredictionResponse`
- **Wrapper**: `ApiResponse<T>` - Consistent JSON structure

---

### ⚠️ Exceptions (`exception/`)

Custom exceptions with `@RestControllerAdvice` global handler:

- `DuplicateEmailException` → HTTP 409
- `InvalidCredentialsException` → HTTP 401
- `JournalCooldownException` → HTTP 429 (includes `nextAvailableTime`, `secondsRemaining`)

---

## Data Flow Examples

### 1. Journal Submission Flow

```
User → JournalController.submitJournal()
         ↓
    JournalService.submitJournal()
         ↓
    1. Validate 24-hour cooldown
    2. Increment user level
    3. Save JournalEntry
    4. Update user.lastJournalTimestamp
    5. If level 30 → trigger AI prediction
    6. If level 30 → reset cycle
         ↓
    Return JournalEntryResponse
```

### 2. AI Career Prediction Flow

```
Trigger: User completes Level 30
         ↓
    CareerService.generateCareerPrediction()
         ↓
    1. Fetch 30 JournalEntries from DB
    2. Concatenate reflections into prompt
    3. Call Gemini API via WebClient
    4. Parse JSON response
    5. Save CareerPrediction to DB
    6. Return CareerPredictionResponse
```

### 3. Authentication Flow

```
User → AuthController.login()
         ↓
    AuthService.login()
         ↓
    1. Find user by email
    2. Validate password with BCrypt
    3. Generate JWT token with JwtUtil
    4. Return AuthResponse with token
         ↓
    User stores token
    User includes in header: "Authorization: Bearer {token}"
         ↓
    JwtAuthenticationFilter validates on each request
```

---

## Key Business Rules Implementation

### ✅ 24-Hour Cooldown

**File**: `JournalService.java`

```java
if (user.getLastJournalTimestamp() != null) {
    Instant nextAvailableTime = user.getLastJournalTimestamp().plus(Duration.ofHours(24));
    if (Instant.now().isBefore(nextAvailableTime)) {
        throw new JournalCooldownException(...);
    }
}
```

### ✅ Level Progression & Cycle Reset

**File**: `JournalService.java`

```java
int newLevel = user.getCurrentLevel() + 1;
boolean cycleCompleted = newLevel > 30;

if (cycleCompleted) {
    // Trigger AI prediction
    careerService.generateCareerPrediction(user.getId(), user.getCurrentCycle());
    
    // Reset for new cycle
    user.setCurrentCycle(user.getCurrentCycle() + 1);
    user.setCurrentLevel(0);
} else {
    user.setCurrentLevel(newLevel);
}
```

### ✅ Historical Journal Preservation

Journals are **NEVER deleted**. Old cycles remain in database:

```java
// Fetch all journals for a specific cycle
journalEntryRepository.findByUserIdAndCycleOrderByLevelAsc(userId, cycle);
```

---

## Configuration Files

### pom.xml
Dependencies:
- Spring Boot 3.2.1
- Spring Security
- Spring Data JPA
- PostgreSQL Driver
- JWT (jjwt 0.12.3)
- WebFlux (for Gemini API)
- Lombok

### application.yml
- Database connection
- JPA/Hibernate settings
- JWT secret & expiration
- Gemini API URL & key

### docker-compose.yml
- PostgreSQL container
- Backend container
- Network configuration

---

## API Authentication

All endpoints except `/api/auth/*` require JWT:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token extracted by `JwtAuthenticationFilter` → validated by `JwtUtil` → user loaded by `CustomUserDetailsService`.

---

## Database Indexes

Performance optimization indexes:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- Journal Entries
CREATE INDEX idx_journal_user_cycle ON journal_entries(user_id, cycle);
CREATE INDEX idx_journal_user_created ON journal_entries(user_id, created_at);

-- Career Predictions
CREATE INDEX idx_career_user_cycle ON career_predictions(user_id, cycle);
CREATE INDEX idx_career_generated ON career_predictions(user_id, generated_at DESC);
```

---

## Testing Strategy

1. **Unit Tests**: Service layer business logic
2. **Integration Tests**: Controller → Service → Repository
3. **Security Tests**: JWT authentication & authorization
4. **API Tests**: Use `API_EXAMPLES.md` curl commands

---

## Deployment Checklist

Before production:

1. ✅ Change `JWT_SECRET` to 256-bit random string
2. ✅ Set strong database password
3. ✅ Update CORS origins in `SecurityConfig.java`
4. ✅ Set `spring.jpa.hibernate.ddl-auto=validate`
5. ✅ Configure production database URL
6. ✅ Enable HTTPS/TLS
7. ✅ Set up logging & monitoring
8. ✅ Configure Gemini API rate limits

---

## Summary

This is a **production-ready** Spring Boot 3 backend with:

✅ JWT Authentication  
✅ 24-Hour Journal Cooldown System  
✅ 30-Day Cycle Tracking  
✅ Google Gemini AI Integration  
✅ PostgreSQL Database  
✅ Comprehensive Error Handling  
✅ RESTful API Design  
✅ Docker Support  
✅ Complete Documentation
