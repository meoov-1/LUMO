# Lumo Backend - Quick Start Guide

## Prerequisites Checklist

- [ ] Java 17 or higher installed
- [ ] Maven 3.6+ installed
- [ ] PostgreSQL 14+ running
- [ ] Google Gemini API Key obtained

## Step-by-Step Setup

### 1. Verify Java Installation

```bash
java -version
# Should show Java 17 or higher
```

### 2. Verify Maven Installation

```bash
mvn -version
```

### 3. Create PostgreSQL Database

Connect to PostgreSQL:
```bash
psql -U postgres
```

Create database:
```sql
CREATE DATABASE lumo_db;
\q
```

### 4. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Copy your API key

### 5. Configure Environment Variables

**Option A: Create .env file** (Recommended)

Create `backend/.env`:
```properties
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-at-least-256-bits-long
GEMINI_API_KEY=your-gemini-api-key-here
```

**Option B: Export environment variables**

Windows (CMD):
```cmd
set DB_USERNAME=postgres
set DB_PASSWORD=your_password
set JWT_SECRET=your-jwt-secret
set GEMINI_API_KEY=your-gemini-api-key
```

Linux/Mac:
```bash
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export JWT_SECRET=your-jwt-secret
export GEMINI_API_KEY=your-gemini-api-key
```

### 6. Build the Project

```bash
cd backend
mvn clean install
```

### 7. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

## Verify Installation

### Test Health Endpoint

Try registering a user:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "test@example.com",
    "fullName": "Test User",
    "userId": 1
  }
}
```

## Docker Setup (Alternative)

### Run with Docker Compose

```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL container on port 5432
- Backend application on port 8080

### Stop containers

```bash
docker-compose down
```

## Troubleshooting

### Issue: "Port 8080 already in use"

Change port in `application.yml`:
```yaml
server:
  port: 8081
```

### Issue: "Cannot connect to database"

1. Check PostgreSQL is running:
```bash
# Windows
sc query postgresql

# Linux/Mac
sudo systemctl status postgresql
```

2. Verify database exists:
```bash
psql -U postgres -l
```

### Issue: "Gemini API call failed"

1. Verify API key is correct
2. Check you have Gemini API enabled in Google Cloud Console
3. Ensure you're using the correct API endpoint

### Issue: "Build failed - dependency errors"

Clear Maven cache:
```bash
mvn clean
rm -rf ~/.m2/repository
mvn install
```

## Next Steps

1. Test all API endpoints using the examples in `README.md`
2. Configure production settings in `application-prod.yml`
3. Set up CI/CD pipeline
4. Deploy to cloud platform (AWS, GCP, Azure)

## Support

For issues or questions:
- Check `README.md` for API documentation
- Review application logs: `logs/spring.log`
- Enable debug logging in `application.yml`

## Security Notes

⚠️ **Before Production Deployment:**

1. Change `JWT_SECRET` to a cryptographically secure random string
2. Use strong database passwords
3. Never commit `.env` file to version control
4. Enable HTTPS/TLS
5. Update CORS configuration for production domains
6. Set `spring.jpa.hibernate.ddl-auto` to `validate`
