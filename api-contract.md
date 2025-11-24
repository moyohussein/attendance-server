# API Contract: Attendance Management System

## Base URL
`https://attendance-server.example.com/api`

## Authentication
All protected endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Role-Based Access Control
- **Super Admin**: Global administrative access
- **School Owner**: Full access to their school's data
- **Teacher**: Access limited to assigned classes and students

## API Endpoints

### Authentication

#### POST /auth/register
**Description**: Register a new user account
**Authentication**: Public
**Roles**: N/A

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "role": "enum (optional, default: teacher)"
}
```

**Response:**
- `201 Created`: User successfully registered
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string",
  "schoolId": "uuid (if applicable)"
}
```
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

#### POST /auth/login
**Description**: Authenticate user with email and password and return JWT token
**Authentication**: Public
**Roles**: N/A

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
- `200 OK`: Authentication successful
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "schoolId": "uuid (if applicable)"
  }
}
```
- `401 Unauthorized`: Invalid credentials

#### GET /auth/google
**Description**: Initiates Google OAuth flow, redirects user to Google consent screen
**Authentication**: Public
**Roles**: N/A

**Query Parameters:**
- `redirect_uri` (optional): Where to redirect after successful authentication (default: frontend URL)

**Response:**
- `302 Found`: Redirects to Google's OAuth consent screen

#### GET /auth/google/callback
**Description**: Handles Google OAuth callback, exchanges authorization code for tokens and creates/updates user
**Authentication**: Public
**Roles**: N/A

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection

**Response:**
- `302 Found`: Redirects to frontend with JWT token in URL fragment or query parameters
- `400 Bad Request`: Missing code or invalid state
- `401 Unauthorized`: Invalid authorization code

#### POST /auth/google/login
**Description**: Alternative endpoint for Google OAuth flow that returns JWT token directly (for SPAs)
**Authentication**: Public
**Roles**: N/A

**Request:**
```json
{
  "code": "string (required)",
  "state": "string (required, if provided during initial request)"
}
```

**Response:**
- `200 OK`: Authentication successful
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "schoolId": "uuid (if applicable)",
    "googleId": "string (if authenticated via Google)"
  }
}
```
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid authorization code

### Schools

#### POST /schools
**Description**: Create a new school
**Authentication**: JWT Required
**Roles**: School Owner (only for creating own school) or Super Admin

**Request:**
```json
{
  "name": "string (required)",
  "address": "string (optional)"
}
```

**Response:**
- `201 Created`: School successfully created
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string",
  "ownerId": "uuid",
  "createdAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions

#### GET /schools/{id}
**Description**: Get school details
**Authentication**: JWT Required
**Roles**: School Owner of the school or Super Admin

**Response:**
- `200 OK`: School details retrieved
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string",
  "ownerId": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to access this school
- `404 Not Found`: School not found

#### PUT /schools/{id}
**Description**: Update school details
**Authentication**: JWT Required
**Roles**: School Owner of the school or Super Admin

**Request:**
```json
{
  "name": "string (optional)",
  "address": "string (optional)"
}
```

**Response:**
- `200 OK`: School updated successfully
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string",
  "ownerId": "uuid",
  "updatedAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this school
- `404 Not Found`: School not found

### Teachers

#### POST /teachers/invite
**Description**: Invite a teacher to a school
**Authentication**: JWT Required
**Roles**: School Owner of the school

**Request:**
```json
{
  "email": "string (required)",
  "schoolId": "uuid (required)"
}
```

**Response:**
- `200 OK`: Invitation sent successfully
```json
{
  "message": "Invitation sent successfully"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to invite to this school
- `404 Not Found`: School not found

#### POST /teachers/accept-invite
**Description**: Accept teacher invitation
**Authentication**: JWT Required (teacher's account)
**Roles**: Teacher

**Request:**
```json
{
  "invitationToken": "string (required)"
}
```

**Response:**
- `200 OK`: Invitation accepted successfully
```json
{
  "message": "Invitation accepted successfully",
  "schoolId": "uuid"
}
```
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Invalid or expired token

#### GET /teachers
**Description**: Get all teachers in the authenticated user's school
**Authentication**: JWT Required
**Roles**: School Owner or Teacher (same school)

**Response:**
- `200 OK`: Teachers list retrieved
```json
[
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "schoolId": "uuid",
    "createdAt": "timestamp"
  }
]
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view teachers

#### DELETE /teachers/{id}
**Description**: Remove a teacher from a school
**Authentication**: JWT Required
**Roles**: School Owner of the teacher's school

**Response:**
- `200 OK`: Teacher removed successfully
```json
{
  "message": "Teacher removed successfully"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to remove this teacher
- `404 Not Found`: Teacher not found in school

### Classes

#### POST /classes
**Description**: Create a new class
**Authentication**: JWT Required
**Roles**: School Owner of the school or Super Admin

**Request:**
```json
{
  "name": "string (required)",
  "schoolId": "uuid (required)",
  "teacherId": "uuid (optional)"
}
```

**Response:**
- `201 Created`: Class successfully created
```json
{
  "id": "uuid",
  "name": "string",
  "schoolId": "uuid",
  "teacherId": "uuid",
  "createdAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to create class in this school
- `400 Bad Request`: Validation errors

#### GET /classes
**Description**: Get all classes in the authenticated user's school
**Authentication**: JWT Required
**Roles**: School Owner of the school or Teacher of assigned classes

**Query Parameters:**
- `teacherId` (optional): Filter classes by teacher

**Response:**
- `200 OK`: Classes list retrieved
```json
[
  {
    "id": "uuid",
    "name": "string",
    "schoolId": "uuid",
    "teacherId": "uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view classes

#### DELETE /classes/{id}
**Description**: Delete a class
**Authentication**: JWT Required
**Roles**: School Owner of the school or Super Admin

**Response:**
- `200 OK`: Class deleted successfully
```json
{
  "message": "Class deleted successfully"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to delete this class
- `404 Not Found`: Class not found

### Students

#### POST /students
**Description**: Create a new student
**Authentication**: JWT Required
**Roles**: School Owner of the school

**Request:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "classId": "uuid (required)",
  "schoolId": "uuid (required)",
  "parentEmail": "string (optional)",
  "parentPhone": "string (optional)"
}
```

**Response:**
- `201 Created`: Student successfully created
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "classId": "uuid",
  "schoolId": "uuid",
  "parentEmail": "string",
  "parentPhone": "string",
  "createdAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to create students in this school
- `400 Bad Request`: Validation errors

#### GET /students
**Description**: Get all students in the authenticated user's school
**Authentication**: JWT Required
**Roles**: School Owner of the school or Teacher of assigned classes

**Query Parameters:**
- `classId` (optional): Filter students by class

**Response:**
- `200 OK`: Students list retrieved
```json
[
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "classId": "uuid",
    "schoolId": "uuid",
    "parentEmail": "string",
    "parentPhone": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view students

#### GET /students/{id}
**Description**: Get student details
**Authentication**: JWT Required
**Roles**: School Owner of the student's school or Teacher of assigned class

**Response:**
- `200 OK`: Student details retrieved
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "classId": "uuid",
  "schoolId": "uuid",
  "parentEmail": "string",
  "parentPhone": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this student
- `404 Not Found`: Student not found

#### PUT /students/{id}
**Description**: Update student details
**Authentication**: JWT Required
**Roles**: School Owner of the student's school

**Request:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "classId": "uuid (optional)",
  "parentEmail": "string (optional)",
  "parentPhone": "string (optional)"
}
```

**Response:**
- `200 OK`: Student updated successfully
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "classId": "uuid",
  "schoolId": "uuid",
  "parentEmail": "string",
  "parentPhone": "string",
  "updatedAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to update this student
- `404 Not Found`: Student not found

#### DELETE /students/{id}
**Description**: Delete a student
**Authentication**: JWT Required
**Roles**: School Owner of the student's school

**Response:**
- `200 OK`: Student deleted successfully
```json
{
  "message": "Student deleted successfully"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to delete this student
- `404 Not Found`: Student not found

### Attendance

#### POST /attendance/mark
**Description**: Mark attendance for a student
**Authentication**: JWT Required
**Roles**: Teacher of the student's class

**Request:**
```json
{
  "studentId": "uuid (required)",
  "classId": "uuid (required)",
  "date": "timestamp (optional, default: today)",
  "status": "enum (present|absent|late, default: present)",
  "note": "string (optional)"
}
```

**Response:**
- `200 OK`: Attendance marked successfully
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "classId": "uuid",
  "schoolId": "uuid",
  "teacherId": "uuid",
  "date": "timestamp",
  "status": "string",
  "note": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to mark attendance for this student/class
- `400 Bad Request`: Validation errors

#### GET /attendance/class/{classId}
**Description**: Get attendance records for a class
**Authentication**: JWT Required
**Roles**: School Owner of the class school or Teacher of the class

**Query Parameters:**
- `startDate` (optional): Start date for records
- `endDate` (optional): End date for records

**Response:**
- `200 OK`: Attendance records retrieved
```json
{
  "attendance": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "classId": "uuid",
      "schoolId": "uuid",
      "teacherId": "uuid",
      "date": "timestamp",
      "status": "string",
      "note": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this class attendance
- `404 Not Found`: Class not found

#### GET /attendance/student/{studentId}
**Description**: Get attendance records for a student
**Authentication**: JWT Required
**Roles**: School Owner of the student's school or Teacher of the student's class

**Query Parameters:**
- `startDate` (optional): Start date for records
- `endDate` (optional): End date for records

**Response:**
- `200 OK`: Attendance records retrieved
```json
{
  "attendance": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "classId": "uuid",
      "schoolId": "uuid",
      "teacherId": "uuid",
      "date": "timestamp",
      "status": "string",
      "note": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this student's attendance
- `404 Not Found`: Student not found

### Analytics

#### GET /analytics/school
**Description**: Get analytics for the authenticated user's school
**Authentication**: JWT Required
**Roles**: School Owner of the school or Super Admin

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response:**
- `200 OK`: Analytics data retrieved
```json
{
  "totalStudents": "number",
  "totalTeachers": "number",
  "totalClasses": "number",
  "attendanceRate": "number (percentage)",
  "lateRate": "number (percentage)",
  "absenceRate": "number (percentage)"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this school's analytics

#### GET /analytics/class/{classId}
**Description**: Get analytics for a specific class
**Authentication**: JWT Required
**Roles**: School Owner of the class school or Teacher of the class

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response:**
- `200 OK`: Class analytics retrieved
```json
{
  "classId": "uuid",
  "className": "string",
  "totalStudents": "number",
  "attendanceRate": "number (percentage)",
  "lateRate": "number (percentage)",
  "absenceRate": "number (percentage)"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this class analytics
- `404 Not Found`: Class not found

#### GET /analytics/student/{studentId}
**Description**: Get analytics for a specific student
**Authentication**: JWT Required
**Roles**: School Owner of the student's school or Teacher of the student's class

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response:**
- `200 OK`: Student analytics retrieved
```json
{
  "studentId": "uuid",
  "studentName": "string",
  "attendanceRate": "number (percentage)",
  "lateRate": "number (percentage)",
  "absenceRate": "number (percentage)"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this student's analytics
- `404 Not Found`: Student not found

## Security Measures

### Authentication & Authorization
1. All protected endpoints require valid JWT token
2. Role-based access control ensures users can only access authorized resources
3. Data is scoped by `schoolId` to ensure multi-tenancy
4. Teachers can only access their assigned classes and related students
5. School owners can only access their owned schools

### Input Validation
1. All inputs are validated using Zod schemas
2. SQL injection protection via prepared statements (Drizzle ORM)
3. No SQL query building from user input

### Rate Limiting
1. All endpoints should implement rate limiting to prevent abuse
2. Suggested: 100 requests per minute per authenticated user
3. Public endpoints (e.g., login, register) should have stricter rate limits

### Error Handling
1. Sensitive information is not exposed in error messages
2. Generic error messages for security-related errors
3. Proper HTTP status codes returned

### Data Protection
1. Passwords are hashed using industry-standard algorithms
2. Personal information (email, phone) is protected
3. JWT tokens have appropriate expiration times

## Error Responses

All error responses follow the format:
```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource successfully created
- `400 Bad Request`: Validation or client error
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authorization failed
- `404 Not Found`: Requested resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

## Rate Limiting
- Authenticated users: 100 requests per minute per endpoint
- Unauthenticated users: 10 requests per minute per endpoint
- All rate limiting is tracked by IP address and/or user ID