# API Documentation

## Base URL
- Development: `http://localhost:3001`
- Production: `https://your-backend-domain.railway.app`

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/login
Login user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "AE"
    },
    "token": "jwt-token"
  },
  "message": "Login successful"
}
```

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "AE"
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

### Reports

#### GET /api/reports
Get all reports with filtering and pagination.

**Query Parameters:**
- `status`: Filter by report status
- `clientName`: Filter by client name
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### POST /api/reports
Create a new report with Harvest data integration.

**Request Body:**
```json
{
  "clientName": "Client Name",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "title": "Optional custom title"
}
```

#### GET /api/reports/:id
Get a specific report by ID.

#### PUT /api/reports/:id
Update a report.

**Request Body:**
```json
{
  "title": "Updated title",
  "content": "Updated content"
}
```

#### POST /api/reports/:id/approve
Approve or reject a report.

**Request Body:**
```json
{
  "status": "APPROVED", // or "REJECTED"
  "comments": "Optional comments"
}
```

### Users (Admin only)

#### GET /api/users
Get all users.

#### POST /api/users
Create a new user.

#### PUT /api/users/:id
Update a user.

#### DELETE /api/users/:id
Deactivate a user.

### Dashboard

#### GET /api/dashboard/stats
Get dashboard statistics.

### Harvest Integration

#### GET /api/harvest/clients
Get Harvest clients.

#### GET /api/harvest/projects
Get Harvest projects.

#### GET /api/harvest/time-entries
Get Harvest time entries.

**Query Parameters:**
- `from`: Start date (required)
- `to`: End date (required)
- `client`: Filter by client ID
- `project`: Filter by project ID

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
