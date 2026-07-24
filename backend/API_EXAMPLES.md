# Lumo Backend - API Testing Examples

Complete examples for testing all API endpoints using curl and Postman.

## Prerequisites

- Backend running on `http://localhost:8080`
- PostgreSQL database configured
- Gemini API key set in environment

## 1. User Registration

### Request
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "secure123",
    "fullName": "Alice Johnson"
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInN1YiI6ImFsaWNlQGV4YW1wbGUuY29tIiwiaWF0IjoxNzIxODE2NDAwLCJleHAiOjE3MjE5MDI4MDB9.abcd1234...",
    "email": "alice@example.com",
    "fullName": "Alice Johnson",
    "userId": 1
  }
}
```

**Save the token** - you'll need it for authenticated requests!

---

## 2. User Login

### Request
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "secure123"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "alice@example.com",
    "fullName": "Alice Johnson",
    "userId": 1
  }
}
```

---

## 3. Get User Status

### Request
```bash
curl -X GET http://localhost:8080/api/user/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response - Can Journal Now
```json
{
  "success": true,
  "message": "User status retrieved",
  "data": {
    "userId": 1,
    "email": "alice@example.com",
    "fullName": "Alice Johnson",
    "currentCycle": 1,
    "currentLevel": 0,
    "lastJournalTimestamp": null,
    "timeRemainingUntilNextLevel": null,
    "nextAvailableTime": null,
    "canJournalNow": true
  }
}
```

### Response - Cooldown Active
```json
{
  "success": true,
  "message": "User status retrieved",
  "data": {
    "userId": 1,
    "email": "alice@example.com",
    "fullName": "Alice Johnson",
    "currentCycle": 1,
    "currentLevel": 5,
    "lastJournalTimestamp": "2026-07-24T10:30:00Z",
    "timeRemainingUntilNextLevel": 43200,
    "nextAvailableTime": "2026-07-25T10:30:00Z",
    "canJournalNow": false
  }
}
```

---

## 4. Submit Journal Entry

### Request - First Entry
```bash
curl -X POST http://localhost:8080/api/journal/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today I spent time reflecting on my career goals. I realized that I am passionate about solving complex problems through technology. I want to focus more on backend development and system design.",
    "moodTag": "motivated",
    "reflectionScore": 8
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Journal entry submitted successfully",
  "data": {
    "id": 1,
    "cycle": 1,
    "level": 1,
    "content": "Today I spent time reflecting...",
    "moodTag": "motivated",
    "reflectionScore": 8,
    "createdAt": "2026-07-24T14:30:00Z"
  }
}
```

### Request - Second Entry (Too Soon)
```bash
curl -X POST http://localhost:8080/api/journal/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Another reflection...",
    "moodTag": "curious",
    "reflectionScore": 7
  }'
```

### Error Response (429 Too Many Requests)
```json
{
  "success": false,
  "message": "You can only write 1 reflection entry per 24 hours. Please wait until 2026-07-25T14:30:00Z",
  "nextAvailableTime": "2026-07-25T14:30:00Z",
  "secondsRemaining": 86100
}
```

---

## 5. Get Journal History

### Request - All Entries
```bash
curl -X GET http://localhost:8080/api/journal/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Request - Specific Cycle
```bash
curl -X GET "http://localhost:8080/api/journal/history?cycle=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
```json
{
  "success": true,
  "message": "Journal history retrieved",
  "data": [
    {
      "id": 30,
      "cycle": 1,
      "level": 30,
      "content": "Day 30 reflection...",
      "moodTag": "accomplished",
      "reflectionScore": 9,
      "createdAt": "2026-08-23T14:30:00Z"
    },
    {
      "id": 29,
      "cycle": 1,
      "level": 29,
      "content": "Day 29 reflection...",
      "moodTag": "focused",
      "reflectionScore": 8,
      "createdAt": "2026-08-22T14:30:00Z"
    }
  ]
}
```

---

## 6. Get Career Prediction

### Request
```bash
curl -X GET http://localhost:8080/api/career/prediction \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response (After completing 30 days)
```json
{
  "success": true,
  "message": "Career prediction retrieved",
  "data": {
    "id": 1,
    "cycle": 1,
    "topCareers": [
      "Backend Software Engineer / System Architect",
      "DevOps Engineering Manager",
      "Technical Product Manager"
    ],
    "strengthsSummary": "Your reflections demonstrate strong analytical thinking, problem-solving orientation, and a passion for building scalable systems. You show consistent growth mindset, excellent communication skills, and leadership potential. Key strengths include technical depth, strategic thinking, and ability to balance technical excellence with business outcomes.",
    "growthRoadmap": "1. Deepen system design expertise - study distributed systems patterns\n2. Build leadership skills - mentor junior developers, lead technical discussions\n3. Expand business acumen - understand product metrics and user impact\n4. Contribute to open source - establish technical credibility\n5. Develop cross-functional collaboration skills - work closely with product and design teams",
    "fullAnalysis": "Based on your 30-day reflection journey...",
    "generatedAt": "2026-08-23T15:00:00Z"
  }
}
```

### Error Response (No prediction yet)
```json
{
  "success": false,
  "message": "No career predictions found. Complete a 30-day cycle first."
}
```

---

## 7. Manually Generate Career Prediction

**Note**: Normally triggered automatically after level 30. Use this for testing or regeneration.

### Request
```bash
curl -X POST http://localhost:8080/api/career/generate/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
```json
{
  "success": true,
  "message": "Career prediction generated",
  "data": {
    "id": 1,
    "cycle": 1,
    "topCareers": [...],
    "strengthsSummary": "...",
    "growthRoadmap": "...",
    "fullAnalysis": "...",
    "generatedAt": "2026-08-23T15:00:00Z"
  }
}
```

---

## Testing Workflow

### Complete 30-Day Cycle Simulation

1. **Register/Login**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"
```

2. **Submit 30 Journal Entries** (requires database timestamp manipulation for testing)

For testing, you can manually update the `last_journal_timestamp` in the database:

```sql
-- After each journal submission, update timestamp to allow immediate next entry
UPDATE users SET last_journal_timestamp = last_journal_timestamp - INTERVAL '25 hours' WHERE id = 1;
```

3. **Verify Level Progression**
```bash
curl -X GET http://localhost:8080/api/user/status \
  -H "Authorization: Bearer $TOKEN"
```

4. **Check Career Prediction** (after 30 entries)
```bash
curl -X GET http://localhost:8080/api/career/prediction \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Errors

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 409 Conflict (Duplicate Email)
```json
{
  "success": false,
  "message": "Email already registered: test@example.com"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "content": "Content must be between 10 and 5000 characters",
    "reflectionScore": "Reflection score must be between 1 and 10"
  }
}
```

---

## Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "Lumo Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"fullName\": \"Test User\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": "{{baseUrl}}/api/auth/register"
          }
        }
      ]
    }
  ]
}
```

---

## Load Testing

Use Apache Bench for load testing:

```bash
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/user/status
```

---

## Notes

- Replace `YOUR_JWT_TOKEN` with actual token from login/register response
- Tokens expire after 24 hours
- All timestamps are in ISO 8601 format (UTC)
- Journal cooldown is exactly 24 hours (86400 seconds)
