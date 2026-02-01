# FBR Invoice Management API Documentation

**Base URL**: `http://localhost:5000/api/v1`

**Last Updated**: January 23, 2026

---

## Table of Contents
- [Rate Limiting](#rate-limiting)
- [Authentication APIs](#authentication-apis)
  - [Login](#1-login)
  - [Refresh Token](#2-refresh-token)
  - [Logout](#3-logout)
  - [Get Profile](#4-get-profile)
- [User Management APIs (Admin Only)](#user-management-apis-admin-only)
  - [Create User](#1-create-user)
  - [Get All Users](#2-get-all-users)
  - [Get User by ID](#3-get-user-by-id)
  - [Update User](#4-update-user)
  - [Delete User](#5-delete-user)
  - [Toggle User Status](#6-toggle-user-status)
  - [Update User Password](#7-update-user-password)
- [Scenario Management APIs](#scenario-management-apis)
  - [Admin: Create Global Scenario](#1-admin-create-global-scenario)
  - [Admin: Get All Global Scenarios](#2-admin-get-all-global-scenarios)
  - [Admin: Get Global Scenario by ID](#3-admin-get-global-scenario-by-id)
  - [Admin: Update Global Scenario](#4-admin-update-global-scenario)
  - [Admin: Delete Global Scenario](#5-admin-delete-global-scenario)
  - [Admin: Assign Scenario to User](#6-admin-assign-scenario-to-user)
  - [Admin: Unassign Scenario from User](#7-admin-unassign-scenario-from-user)
  - [Admin: Get User's Assigned Scenarios](#8-admin-get-users-assigned-scenarios)
  - [User: Get My Scenarios](#9-user-get-my-scenarios)
- [Buyer Management APIs](#buyer-management-apis)
  - [Create Buyer](#1-create-buyer)
  - [Get All Buyers](#2-get-all-buyers)
  - [Get Buyer by ID](#3-get-buyer-by-id)
  - [Update Buyer](#4-update-buyer)
  - [Delete Buyer](#5-delete-buyer)
- [HS Code Management APIs](#hs-code-management-apis)
  - [Create HS Code (Single/Bulk)](#1-create-hs-code)
  - [Get All HS Codes](#2-get-all-hs-codes)
  - [Get HS Code by ID](#3-get-hs-code-by-id)
  - [Update HS Code](#4-update-hs-code)
  - [Delete HS Code](#5-delete-hs-code)
- [Invoice Management APIs](#invoice-management-apis)
  - [Post Invoice to FBR (Test Environment)](#1-post-invoice-to-fbr)
  - [Post Invoice to FBR (Production Environment)](#1a-post-invoice-to-fbr-production-environment)
  - [Validate Invoice with FBR](#2-validate-invoice-with-fbr)
  - [Get User Invoices](#3-get-user-invoices)
  - [Get Invoice by ID](#4-get-invoice-by-id)
  - [Delete Invoice](#5-delete-invoice)
- [Invoice Print Settings APIs](#invoice-print-settings-apis)
  - [Get Print Settings](#1-get-print-settings)
  - [Save Print Settings](#2-save-print-settings)
  - [Reset Print Settings](#3-reset-print-settings)
  - [Get Available Fields](#4-get-available-fields)
- [Error Responses](#error-responses)

---

## Rate Limiting

**DDoS Protection**: All API endpoints are protected with rate limiting to prevent abuse and DDoS attacks.

### Rate Limit Tiers

| Endpoint Type | Limit | Window | Response Headers |
|--------------|-------|--------|------------------|
| **General API** | 100 requests | 15 minutes | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| **Authentication** (login, refresh) | 5 requests | 15 minutes | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| **User Creation** | 10 requests | 1 hour | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| **Password Update** | 3 requests | 1 hour | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |

### Rate Limit Headers

Every response includes rate limit information in headers:

```
RateLimit-Limit: 100          # Maximum requests allowed
RateLimit-Remaining: 95       # Remaining requests in current window
RateLimit-Reset: 1705251600   # Unix timestamp when limit resets
```

### Rate Limit Exceeded Response

**Status Code**: 429 Too Many Requests

**Response**:
```json
{
  "status": "fail",
  "message": "Too many requests from this IP, please try again later."
}
```

**For Authentication Endpoints**:
```json
{
  "status": "fail",
  "message": "Too many authentication attempts, please try again after 15 minutes."
}
```

**For User Creation**:
```json
{
  "status": "fail",
  "message": "Too many user creation attempts, please try again later."
}
```

**For Password Updates**:
```json
{
  "status": "fail",
  "message": "Too many password change attempts, please try again after an hour."
}
```

---

## Authentication APIs

### 1. Login

Login with email and password to get access and refresh tokens.

**Endpoint**: `POST /auth/login`

**Rate Limit**: 5 requests per 15 minutes per IP

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "admin@fbr.gov.pk",
  "password": "Admin@123"
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@fbr.gov.pk\",\"password\":\"Admin@123\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Xenax_33",
      "email": "admin@fbr.gov.pk",
      "businessName": "FBR Admin",
      "province": "Islamabad Capital Territory",
      "address": "Constitution Avenue, Islamabad",
      "ntncnic": "1234567890123",
      "role": "ADMIN",
      "postInvoiceTokenTest": null,
      "validateInvoiceTokenTest": null,
      "postInvoiceToken": null,
      "validateInvoiceToken": null,
      "isActive": true,
      "createdAt": "2026-01-14T15:30:00.000Z",
      "updatedAt": "2026-01-14T15:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"}]"
}
```

**401 Unauthorized** - Invalid Credentials:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Invalid email or password"
}
```

---

### 2. Refresh Token

Get a new access token using a refresh token.

**Endpoint**: `POST /auth/refresh`

**Rate Limit**: 5 requests per 15 minutes per IP

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

**400 Bad Request** - Missing Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Refresh token is required"
}
```

**401 Unauthorized** - Invalid/Expired Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Invalid or expired refresh token"
}
```

---

### 3. Logout

Logout and invalidate the refresh token.

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 4. Get Profile

Get the current authenticated user's profile.

**Endpoint**: `GET /auth/profile`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Xenax_33",
      "email": "admin@fbr.gov.pk",
      "businessName": "FBR Admin",
      "province": "Islamabad Capital Territory",
      "address": "Constitution Avenue, Islamabad",
      "ntncnic": "1234567890123",
      "role": "ADMIN",
      "postInvoiceTokenTest": null,
      "validateInvoiceTokenTest": null,
      "postInvoiceToken": null,
      "validateInvoiceToken": null,
      "isActive": true,
      "createdAt": "2026-01-14T15:30:00.000Z",
      "updatedAt": "2026-01-14T15:30:00.000Z"
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Missing Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**401 Unauthorized** - Invalid Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Invalid or expired token"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

## User Management APIs (Admin Only)

All user management endpoints require:
- **Authentication**: Valid access token
- **Authorization**: ADMIN role

**Required Header**:
```
Authorization: Bearer <admin-access-token>
```

---

### 1. Create User

Create a new user (Admin only).

**Endpoint**: `POST /users`

**Rate Limit**: 10 requests per hour per IP

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "businessName": "ABC Trading Company",
  "province": "Punjab",
  "address": "123 Main Street, Lahore, Pakistan",
  "ntncnic": "3520212345678",
  "password": "SecurePass@123",
  "postInvoiceTokenTest": "test_token_123",
  "validateInvoiceTokenTest": "validate_test_token_456",
  "postInvoiceToken": "prod_token_789",
  "validateInvoiceToken": "validate_prod_token_012"
}
```

**Note**: All FBR token fields are optional. Only include them if you have the tokens.

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john.doe@example.com\",\"businessName\":\"ABC Trading Company\",\"province\":\"Punjab\",\"address\":\"123 Main Street, Lahore\",\"ntncnic\":\"3520212345678\",\"password\":\"SecurePass@123\"}"
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "businessName": "ABC Trading Company",
      "province": "Punjab",
      "address": "123 Main Street, Lahore, Pakistan",
      "ntncnic": "3520212345678",
      "role": "USER",
      "postInvoiceTokenTest": "test_token_123",
      "validateInvoiceTokenTest": "validate_test_token_456",
      "postInvoiceToken": "prod_token_789",
      "validateInvoiceToken": "validate_prod_token_012",
      "isActive": true,
      "createdAt": "2026-01-14T16:00:00.000Z",
      "updatedAt": "2026-01-14T16:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"},{\"field\":\"password\",\"message\":\"Password must be at least 8 characters long\"}]"
}
```

**400 Bad Request** - Duplicate User:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "User with this email or NTN/CNIC already exists"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

---

### 2. Get All Users

Get a paginated list of all users with optional filtering.

**Endpoint**: `GET /users`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name, email, business name, or NTN/CNIC
- `role` (optional): Filter by role (ADMIN or USER)
- `isActive` (optional): Filter by active status (true or false)

**cURL Request**:
```bash
# Get all users (page 1, 10 per page)
curl -X GET "http://localhost:5000/api/v1/users" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# With pagination
curl -X GET "http://localhost:5000/api/v1/users?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/users?search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# Filter by role and status
curl -X GET "http://localhost:5000/api/v1/users?role=USER&isActive=true" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# Combined filters
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=5&search=trading&role=USER&isActive=true" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Xenax_33",
        "email": "admin@fbr.gov.pk",
        "businessName": "FBR Admin",
        "province": "Islamabad Capital Territory",
        "address": "Constitution Avenue, Islamabad",
        "ntncnic": "1234567890123",
        "role": "ADMIN",
        "isActive": true,
        "createdAt": "2026-01-14T15:30:00.000Z",
        "updatedAt": "2026-01-14T15:30:00.000Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "businessName": "ABC Trading Company",
        "province": "Punjab",
        "address": "123 Main Street, Lahore",
        "ntncnic": "3520212345678",
        "role": "USER",
        "isActive": true,
        "createdAt": "2026-01-14T16:00:00.000Z",
        "updatedAt": "2026-01-14T16:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

---

### 3. Get User by ID

Get detailed information about a specific user.

**Endpoint**: `GET /users/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: User ID (UUID)

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "businessName": "ABC Trading Company",
      "province": "Punjab",
      "address": "123 Main Street, Lahore, Pakistan",
      "ntncnic": "3520212345678",
      "role": "USER",
      "postInvoiceTokenTest": "test_token_123",
      "validateInvoiceTokenTest": "validate_test_token_456",
      "postInvoiceToken": "prod_token_789",
      "validateInvoiceToken": "validate_prod_token_012",
      "isActive": true,
      "createdAt": "2026-01-14T16:00:00.000Z",
      "updatedAt": "2026-01-14T16:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 4. Update User

Update user information (Admin only).

**Endpoint**: `PATCH /users/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**URL Parameters**:
- `id`: User ID (UUID)

**Request Body** (all fields are optional):
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "businessName": "XYZ Trading Company",
  "province": "Sindh",
  "address": "456 New Avenue, Karachi",
  "ntncnic": "4210312345678",
  "postInvoiceTokenTest": "new_test_token",
  "validateInvoiceTokenTest": "new_validate_test_token",
  "postInvoiceToken": "new_prod_token",
  "validateInvoiceToken": "new_validate_prod_token"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Smith\",\"businessName\":\"XYZ Trading Company\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Smith",
      "email": "john.smith@example.com",
      "businessName": "XYZ Trading Company",
      "province": "Sindh",
      "address": "456 New Avenue, Karachi",
      "ntncnic": "4210312345678",
      "role": "USER",
      "postInvoiceTokenTest": "new_test_token",
      "validateInvoiceTokenTest": "new_validate_test_token",
      "postInvoiceToken": "new_prod_token",
      "validateInvoiceToken": "new_validate_prod_token",
      "isActive": true,
      "createdAt": "2026-01-14T16:00:00.000Z",
      "updatedAt": "2026-01-14T17:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"}]"
}
```

**400 Bad Request** - Duplicate Email/NTN:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Email or NTN/CNIC already in use"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 5. Delete User

Delete a user (Admin only). Cannot delete admin users.

**Endpoint**: `DELETE /users/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: User ID (UUID)

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**403 Forbidden** - Cannot Delete Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "Cannot delete admin user"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 6. Toggle User Status

Toggle a user's active/inactive status (Admin only). Cannot deactivate admin users.

**Endpoint**: `PATCH /users/:id/toggle-status`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: User ID (UUID)

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001/toggle-status" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "businessName": "ABC Trading Company",
      "isActive": false
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**403 Forbidden** - Cannot Deactivate Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "Cannot deactivate admin user"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 7. Update User Password

Update a user's password (Admin only). This will force the user to re-login.

**Endpoint**: `PATCH /users/:id/password`

**Rate Limit**: 3 requests per hour per IP

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**URL Parameters**:
- `id`: User ID (UUID)

**Request Body**:
```json
{
  "password": "NewSecurePass@456"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&#)

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001/password" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"NewSecurePass@456\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Password updated successfully"
}
```

**Note**: All refresh tokens for this user are invalidated, forcing re-login.

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"password\",\"message\":\"Password must be at least 8 characters long\"}]"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

## Scenario Management APIs

The scenario system allows admins to create global scenarios and assign them to users. Users can only view their assigned scenarios.

### System Overview
- **Global Scenarios**: Managed by admin (CRUD operations)
- **User Assignments**: Admin assigns global scenarios to specific users
- **User Access**: Users can only view scenarios assigned to them

---

### 1. Admin: Create Global Scenario

Create a new global scenario (Admin only).

**Endpoint**: `POST /scenarios/global`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "scenarioCode": "SCEN001",
  "scenarioDescription": "Standard sale of goods"
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/scenarios/global \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenarioCode":"SCEN001","scenarioDescription":"Standard sale of goods"}'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "scenario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "scenarioCode": "SCEN001",
      "scenarioDescription": "Standard sale of goods",
      "createdAt": "2026-01-18T14:30:00.000Z",
      "updatedAt": "2026-01-18T14:30:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Duplicate Scenario Code:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Scenario code already exists"
}
```

---

### 2. Admin: Get All Global Scenarios

Get a paginated list of all global scenarios (Admin only).

**Endpoint**: `GET /scenarios/global`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search in scenario code or description

**cURL Request**:
```bash
# Get all scenarios
curl -X GET "http://localhost:5000/api/v1/scenarios/global" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/scenarios/global?search=sale" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenarios": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "scenarioCode": "SCEN001",
        "scenarioDescription": "Standard sale of goods",
        "createdAt": "2026-01-18T14:30:00.000Z",
        "updatedAt": "2026-01-18T14:30:00.000Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "scenarioCode": "SCEN002",
        "scenarioDescription": "Export of goods",
        "createdAt": "2026-01-18T14:35:00.000Z",
        "updatedAt": "2026-01-18T14:35:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

### 3. Admin: Get Global Scenario by ID

Get details of a specific global scenario (Admin only).

**Endpoint**: `GET /scenarios/global/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: Scenario ID (UUID)

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/scenarios/global/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "scenarioCode": "SCEN001",
      "scenarioDescription": "Standard sale of goods",
      "createdAt": "2026-01-18T14:30:00.000Z",
      "updatedAt": "2026-01-18T14:30:00.000Z"
    }
  }
}
```

**Error Responses**:

**404 Not Found**:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Scenario not found"
}
```

---

### 4. Admin: Update Global Scenario

Update a global scenario (Admin only).

**Endpoint**: `PATCH /scenarios/global/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**URL Parameters**:
- `id`: Scenario ID (UUID)

**Request Body** (all fields optional):
```json
{
  "scenarioCode": "SCEN001_UPDATED",
  "scenarioDescription": "Updated description for standard sale"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/scenarios/global/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenarioDescription":"Updated description for standard sale"}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "scenarioCode": "SCEN001",
      "scenarioDescription": "Updated description for standard sale",
      "createdAt": "2026-01-18T14:30:00.000Z",
      "updatedAt": "2026-01-18T15:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Scenario Code In Use:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Scenario code already in use"
}
```

---

### 5. Admin: Delete Global Scenario

Delete a global scenario (Admin only). Cannot delete if assigned to users.

**Endpoint**: `DELETE /scenarios/global/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: Scenario ID (UUID)

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/scenarios/global/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**Error Responses**:

**400 Bad Request** - Scenario Assigned to Users:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Cannot delete scenario. It is assigned to 5 user(s). Please unassign it first."
}
```

---

### 6. Admin: Assign Scenario to User

Assign a global scenario to a user (Admin only).

**Endpoint**: `POST /scenarios/assign`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "userId": "660e8400-e29b-41d4-a716-446655440001",
  "scenarioId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/scenarios/assign \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"660e8400-e29b-41d4-a716-446655440001","scenarioId":"550e8400-e29b-41d4-a716-446655440000"}'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "assignment": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "userId": "660e8400-e29b-41d4-a716-446655440001",
      "scenarioId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-01-18T15:30:00.000Z",
      "scenario": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "scenarioCode": "SCEN001",
        "scenarioDescription": "Standard sale of goods",
        "createdAt": "2026-01-18T14:30:00.000Z",
        "updatedAt": "2026-01-18T14:30:00.000Z"
      },
      "user": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Already Assigned:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Scenario already assigned to this user"
}
```

**404 Not Found** - User or Scenario Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 7. Admin: Unassign Scenario from User

Remove a scenario assignment from a user (Admin only).

**Endpoint**: `POST /scenarios/unassign`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "userId": "660e8400-e29b-41d4-a716-446655440001",
  "scenarioId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/scenarios/unassign \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"660e8400-e29b-41d4-a716-446655440001","scenarioId":"550e8400-e29b-41d4-a716-446655440000"}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Scenario unassigned successfully"
}
```

**Error Responses**:

**404 Not Found** - Assignment Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Scenario assignment not found"
}
```

---

### 8. Admin: Get User's Assigned Scenarios

Get all scenarios assigned to a specific user (Admin only).

**Endpoint**: `GET /scenarios/user/:userId`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `userId`: User ID (UUID)

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/scenarios/user/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenarios": [
      {
        "assignmentId": "770e8400-e29b-41d4-a716-446655440002",
        "scenarioId": "550e8400-e29b-41d4-a716-446655440000",
        "scenarioCode": "SCEN001",
        "scenarioDescription": "Standard sale of goods",
        "assignedAt": "2026-01-18T15:30:00.000Z"
      },
      {
        "assignmentId": "880e8400-e29b-41d4-a716-446655440003",
        "scenarioId": "660e8400-e29b-41d4-a716-446655440001",
        "scenarioCode": "SCEN002",
        "scenarioDescription": "Export of goods",
        "assignedAt": "2026-01-18T15:35:00.000Z"
      }
    ]
  }
}
```

**Error Responses**:

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 9. User: Get My Scenarios

Get all scenarios assigned to the authenticated user.

**Endpoint**: `GET /scenarios/my-scenarios`

**Headers**:
```
Authorization: Bearer <user-access-token>
```

**cURL Request**:
```bash
curl -X GET http://localhost:5000/api/v1/scenarios/my-scenarios \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenarios": [
      {
        "assignmentId": "770e8400-e29b-41d4-a716-446655440002",
        "scenarioId": "550e8400-e29b-41d4-a716-446655440000",
        "scenarioCode": "SCEN001",
        "scenarioDescription": "Standard sale of goods",
        "assignedAt": "2026-01-18T15:30:00.000Z"
      },
      {
        "assignmentId": "880e8400-e29b-41d4-a716-446655440003",
        "scenarioId": "660e8400-e29b-41d4-a716-446655440001",
        "scenarioCode": "SCEN002",
        "scenarioDescription": "Export of goods",
        "assignedAt": "2026-01-18T15:35:00.000Z"
      }
    ]
  }
}
```

**Note**: Users can only see scenarios that have been assigned to them by an admin.

---

## Buyer Management APIs

All buyer endpoints require authentication. Users can only manage their own buyers.

**Required Header**:
```
Authorization: Bearer <access-token>
```

---

### 1. Create Buyer

Create a new buyer for the authenticated user.

**Endpoint**: `POST /buyers`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "ntncnic": "9876543210987",
  "businessName": "XYZ Corporation",
  "province": "Sindh",
  "address": "456 Business Avenue, Karachi",
  "registrationType": "Registered"
}
```

**Field Descriptions**:
- `ntncnic`: 13-digit NTN/CNIC (required)
- `businessName`: Business name (required, 2-255 characters)
- `province`: Province (required)
- `address`: Complete address (required, min 5 characters)
- `registrationType`: "Registered" or "Unregistered" (required)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/buyers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ntncnic": "9876543210987",
    "businessName": "XYZ Corporation",
    "province": "Sindh",
    "address": "456 Business Avenue, Karachi",
    "registrationType": "Registered"
  }'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "buyer": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "ntncnic": "9876543210987",
      "businessName": "XYZ Corporation",
      "province": "Sindh",
      "address": "456 Business Avenue, Karachi",
      "registrationType": "Registered",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Duplicate Buyer:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Buyer with this NTN/CNIC already exists"
}
```

**401 Unauthorized**:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

---

### 2. Get All Buyers

Get a paginated list of buyers for the authenticated user.

**Endpoint**: `GET /buyers`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in NTN/CNIC, business name, or province
- `registrationType` (optional): Filter by "Registered" or "Unregistered"

**cURL Request**:
```bash
# Get all buyers
curl -X GET "http://localhost:5000/api/v1/buyers" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/buyers?search=XYZ" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by registration type
curl -X GET "http://localhost:5000/api/v1/buyers?registrationType=Registered" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "buyers": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "ntncnic": "9876543210987",
        "businessName": "XYZ Corporation",
        "province": "Sindh",
        "address": "456 Business Avenue, Karachi",
        "registrationType": "Registered",
        "createdAt": "2026-01-17T10:00:00.000Z",
        "updatedAt": "2026-01-17T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Buyer by ID

Get detailed information about a specific buyer.

**Endpoint**: `GET /buyers/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/buyers/990e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "buyer": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "ntncnic": "9876543210987",
      "businessName": "XYZ Corporation",
      "province": "Sindh",
      "address": "456 Business Avenue, Karachi",
      "registrationType": "Registered",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

**404 Not Found**:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Buyer not found"
}
```

---

### 4. Update Buyer

Update buyer information.

**Endpoint**: `PATCH /buyers/:id`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "businessName": "XYZ Corporation Ltd",
  "address": "789 New Business Park, Karachi"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/buyers/990e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"XYZ Corporation Ltd"}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "buyer": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "ntncnic": "9876543210987",
      "businessName": "XYZ Corporation Ltd",
      "province": "Sindh",
      "address": "789 New Business Park, Karachi",
      "registrationType": "Registered",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T11:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Buyer

Delete a buyer (only if not used in any invoices).

**Endpoint**: `DELETE /buyers/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/buyers/990e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**400 Bad Request** - Buyer In Use:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Cannot delete buyer that is used in invoices"
}
```

---

## HS Code Management APIs

All HS Code endpoints require authentication. Users can only manage their own HS codes.

**Required Header**:
```
Authorization: Bearer <access-token>
```

---

### 1. Create HS Code

Create a new HS Code for the authenticated user. Supports both single and bulk creation.

**Endpoint**: `POST /hs-codes`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

#### Single HS Code Creation

**Request Body**:
```json
{
  "hsCode": "0000.0000",
  "description": "Sample product category"
}
```

**Field Descriptions**:
- `hsCode`: HS Code in format XXXX.XXXX (required)
- `description`: Description of the HS Code (optional, max 500 characters)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hs-codes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hsCode": "0000.0000",
    "description": "Sample product category"
  }'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "hsCode": {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "hsCode": "0000.0000",
      "description": "Sample product category",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

#### Bulk HS Code Creation

**Request Body**:
```json
{
  "hsCodes": [
    {
      "hsCode": "0101.2100",
      "description": "Live horses - Pure-bred breeding animals"
    },
    {
      "hsCode": "0201.1000",
      "description": "Carcasses and half-carcasses of bovine animals, fresh or chilled"
    },
    {
      "hsCode": "0301.1100",
      "description": "Ornamental fish - Freshwater"
    }
  ]
}
```

**Field Descriptions**:
- `hsCodes`: Array of HS Code objects (required, minimum 1 item)
  - `hsCode`: HS Code in format XXXX.XXXX (required for each item)
  - `description`: Description of the HS Code (optional for each item, max 500 characters)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hs-codes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hsCodes": [
      {
        "hsCode": "0101.2100",
        "description": "Live horses - Pure-bred breeding animals"
      },
      {
        "hsCode": "0201.1000",
        "description": "Carcasses and half-carcasses of bovine animals, fresh or chilled"
      }
    ]
  }'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total": 3,
      "created": 2,
      "failed": 1
    },
    "created": [
      {
        "id": "bb1e8400-e29b-41d4-a716-446655440002",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "hsCode": "0101.2100",
        "description": "Live horses - Pure-bred breeding animals",
        "createdAt": "2026-01-23T10:00:00.000Z",
        "updatedAt": "2026-01-23T10:00:00.000Z"
      },
      {
        "id": "cc2e8400-e29b-41d4-a716-446655440003",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "hsCode": "0201.1000",
        "description": "Carcasses and half-carcasses of bovine animals, fresh or chilled",
        "createdAt": "2026-01-23T10:00:00.000Z",
        "updatedAt": "2026-01-23T10:00:00.000Z"
      }
    ],
    "failed": [
      {
        "hsCode": "0301.1100",
        "reason": "HS Code already exists"
      }
    ]
  }
}
```

**Error Responses**:

**400 Bad Request** - Duplicate HS Code (Single Creation):
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "HS Code already exists"
}
```

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"hsCode\",\"message\":\"HS Code must be in format XXXX.XXXX (e.g., 0000.0000)\"}]"
}
```

---

### 2. Get All HS Codes

Get a paginated list of HS Codes for the authenticated user.

**Endpoint**: `GET /hs-codes`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in HS Code or description

**cURL Request**:
```bash
# Get all HS codes
curl -X GET "http://localhost:5000/api/v1/hs-codes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/hs-codes?search=0000" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "hsCodes": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "hsCode": "0000.0000",
        "description": "Sample product category",
        "createdAt": "2026-01-17T10:00:00.000Z",
        "updatedAt": "2026-01-17T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get HS Code by ID

Get detailed information about a specific HS Code.

**Endpoint**: `GET /hs-codes/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/hs-codes/aa0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "hsCode": {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "hsCode": "0000.0000",
      "description": "Sample product category",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

---

### 4. Update HS Code

Update HS Code information.

**Endpoint**: `PATCH /hs-codes/:id`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "description": "Updated product category description"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/hs-codes/aa0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated product category description"}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "hsCode": {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "hsCode": "0000.0000",
      "description": "Updated product category description",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T11:00:00.000Z"
    }
  }
}
```

---

### 5. Delete HS Code

Delete an HS Code (only if not used in any invoice items).

**Endpoint**: `DELETE /hs-codes/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/hs-codes/aa0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**400 Bad Request** - HS Code In Use:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Cannot delete HS Code that is used in invoice items"
}
```

---

## Invoice Management APIs

All invoice endpoints require authentication. Users can only manage their own invoices.

**Important**: Before creating invoices, you must first create:
1. **Buyers** - Using the Buyer Management APIs
2. **HS Codes** - Using the HS Code Management APIs
3. **Scenarios** - Using the Scenario Management APIs

**Seller Information** is automatically fetched from your user profile (NTN/CNIC, business name, province, address).

**Required Header**:
```
Authorization: Bearer <access-token>
```

---

### 1. Post Invoice to FBR (Test Environment)

Submit an invoice to FBR's system (Sandbox or Production environment).

**Prerequisites**: 
- Create buyers using `/buyers` endpoint
- Create HS codes using `/hs-codes` endpoint
- Ensure scenarios exist (if using custom scenarios)

**Endpoint**: `POST /invoices`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "invoiceType": "Sale Invoice",
  "invoiceDate": "2026-01-17",
  "buyerId": "990e8400-e29b-41d4-a716-446655440001",
  "scenarioId": "aa0e8400-e29b-41d4-a716-446655440001",
  "invoiceRefNo": "INV-2026-001",
  "isTestEnvironment": true,
  "items": [
    {
      "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
      "productDescription": "Sample Product",
      "rate": "17%",
      "uoM": "PCS",
      "quantity": 10,
      "totalValues": 1000,
      "valueSalesExcludingST": 854.70,
      "fixedNotifiedValueOrRetailPrice": 1000,
      "salesTaxApplicable": 145.30,
      "salesTaxWithheldAtSource": 0,
      "extraTax": "",
      "furtherTax": 0,
      "sroScheduleNo": "",
      "fedPayable": 0,
      "discount": 0,
      "sroItemSerialNo": ""
    }
  ]
}
```

**Field Descriptions**:
- `invoiceType`: Type of invoice (e.g., "Sale Invoice") - required
- `invoiceDate`: Date in yyyy-MM-dd format - required
- `buyerId`: UUID of the buyer (must be created first) - required
- `scenarioId`: UUID of the scenario - required
- `invoiceRefNo`: Optional reference number
- `isTestEnvironment`: true for sandbox, false for production (default: true)
- `items`: Array of invoice items (at least 1 required)

**Seller Information** (automatically fetched from your user profile):
- Seller's NTN/CNIC
- Seller's business name
- Seller's province
- Seller's address

**Buyer Information** (fetched from buyer table using `buyerId`)
**Scenario Information** (fetched from scenario table using `scenarioId` - scenario description is used as `saleType` in FBR request)
**HS Code** (fetched from hs_codes table using `hsCodeId` for each item)

**Item Fields**:
- `hsCodeId`: UUID of the HS Code (must be created first) - required
- `productDescription`: Description of the product - required
- `rate`: Tax rate (e.g., "17%") - required
- `uoM`: Unit of measurement - required
- `quantity`: Quantity of items - required
- `totalValues`: Total value including tax - required
- `valueSalesExcludingST`: Value excluding sales tax - required
- `fixedNotifiedValueOrRetailPrice`: Fixed/retail price - required
- `salesTaxApplicable`: Applicable sales tax amount - required
- `salesTaxWithheldAtSource`: Tax withheld at source - required
- `extraTax`: Additional tax (optional)
- `furtherTax`: Further tax amount - required
- `sroScheduleNo`: SRO schedule number (optional)
- `fedPayable`: Federal excise duty payable - required
- `discount`: Discount amount - required
- `saleType`: Type of sale (optional)
- `sroItemSerialNo`: SRO item serial number (optional)

**Sale Type via Scenario**:
- The system sets `saleType` for all items using the selected scenario's description.
- Pick a scenario by its code (SN001–SN028); keep the description aligned with FBR guidance.
- Examples (Sandbox):
  - SN001: Goods at standard rate to registered buyers
  - SN002: Goods at standard rate to unregistered buyers
  - SN003: Sale of Steel (Melted and Re-Rolled)
  - SN004: Steel Melting and re-rolling / Ship breaking
  - SN005: Reduced rate sale
  - SN006: Goods at Reduced Rate
  - SN007: Exempt Goods
  - SN008: Goods at zero-rate
  - SN009: Cotton Spinners purchase from Cotton Ginners (Textile Sector)
  - SN010: Telecom services rendered or provided
  - SN011: Telecommunication services
  - SN012: Toll Manufacturing (Steel sector)
  - SN013: Petroleum Products
  - SN014: Electricity Supply to Retailers
  - SN015: Gas to CNG stations
  - SN016: Mobile Phones
  - SN017: Processing / Conversion of Goods
  - SN018: Goods (FED in ST Mode)
  - SN019: Services (FED in ST Mode)
  - SN020: Services
  - SN021: Electric Vehicle
  - SN022: Cement / Concrete Block
  - SN023: Potassium Chlorate
  - SN024: CNG Sales
  - SN025: Goods as per SRO 297(1)/2023
  - SN026: Non-Adjustable Supplies
  - SN027: Sale to End Consumer by retailers (Standard Rate)
  - SN028: 3rd Schedule Goods / End Consumer (Reduced Rate)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceType": "Sale Invoice",
    "invoiceDate": "2026-01-17",
    "buyerId": "990e8400-e29b-41d4-a716-446655440001",
    "scenarioId": "aa0e8400-e29b-41d4-a716-446655440001",
    "invoiceRefNo": "INV-2026-001",
    "isTestEnvironment": true,
    "items": [
      {
        "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
        "productDescription": "Sample Product",
        "rate": "17%",
        "uoM": "PCS",
        "quantity": 10,
        "totalValues": 1000,
        "valueSalesExcludingST": 854.70,
        "fixedNotifiedValueOrRetailPrice": 1000,
        "salesTaxApplicable": 145.30,
        "salesTaxWithheldAtSource": 0,
        "extraTax": "",
        "furtherTax": 0,
        "sroScheduleNo": "",
        "fedPayable": 0,
        "discount": 0,
        "sroItemSerialNo": ""
      }
    ]
  }'
```

**Success Response - Valid Invoice (201 Created)**:

**Important**: The invoice is only saved to the database if the FBR validation response indicates success (statusCode "00"). Check the `savedToDatabase` field and `status` to determine if the invoice was saved.

```json
{
  "status": "success",
  "message": "Invoice posted and saved successfully",
  "data": {
    "invoice": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "buyerId": "990e8400-e29b-41d4-a716-446655440001",
      "scenarioId": "aa0e8400-e29b-41d4-a716-446655440001",
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2026-01-17T00:00:00.000Z",
      "invoiceRefNo": "INV-2026-001",
      "fbrInvoiceNumber": "3520223926179DIABXVCA566695",
      "fbrResponse": {
        "invoiceNumber": "3520223926179DIABXVCA566695",
        "dated": "2026-01-23 21:02:52",
        "validationResponse": {
          "statusCode": "00",
          "status": "Valid",
          "error": "",
          "invoiceStatuses": [
            {
              "itemSNo": "1",
              "statusCode": "00",
              "status": "Valid",
              "invoiceNo": "3520223926179DIABXVCA566695-1",
              "errorCode": "",
              "error": ""
            }
          ]
        }
      },
      "isTestEnvironment": true,
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z",
      "items": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440001",
          "invoiceId": "770e8400-e29b-41d4-a716-446655440001",
          "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
          "productDescription": "Sample Product",
          "rate": "17%",
          "uoM": "PCS",
          "quantity": "10",
          "totalValues": "1000.00",
          "valueSalesExcludingST": "854.70",
          "fixedNotifiedValueOrRetailPrice": "1000.00",
          "salesTaxApplicable": "145.30",
          "salesTaxWithheldAtSource": "0.00",
          "extraTax": "",
          "furtherTax": "0.00",
          "sroScheduleNo": "",
          "fedPayable": "0.00",
          "discount": "0.00",
          "saleType": "",
          "sroItemSerialNo": "",
          "createdAt": "2026-01-17T10:00:00.000Z",
          "updatedAt": "2026-01-17T10:00:00.000Z",
          "hsCode": {
            "id": "bb0e8400-e29b-41d4-a716-446655440001",
            "hsCode": "0000.0000",
            "description": "Sample product category"
          }
        }
      ],
      "buyer": {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "ntncnic": "9876543210987",
        "businessName": "XYZ Corporation",
        "province": "Sindh",
        "address": "456 Business Avenue, Karachi",
        "registrationType": "Registered"
      },
      "scenario": {
        "id": "aa0e8400-e29b-41d4-a716-446655440001",
        "scenarioCode": "SN000",
        "scenarioDescription": "Standard Sale"
      }
    },
    "fbrResponse": {
      "invoiceNumber": "3520223926179DIABXVCA566695",
      "dated": "2026-01-23 21:02:52",
      "validationResponse": {
        "statusCode": "00",
        "status": "Valid",
        "error": "",
        "invoiceStatuses": [
          {
            "itemSNo": "1",
            "statusCode": "00",
            "status": "Valid",
            "invoiceNo": "3520223926179DIABXVCA566695-1",
            "errorCode": "",
            "error": ""
          }
        ]
      }
    },
    "savedToDatabase": true
  }
}
```

**Validation Failed Response - Invalid Invoice (200 OK)**:

When FBR returns a validation error (statusCode "01" or any non-"00" code), the invoice is NOT saved to the database:

```json
{
  "status": "validation_failed",
  "message": "Invoice posted to FBR but validation failed. Invoice not saved.",
  "data": {
    "invoice": null,
    "fbrResponse": {
      "dated": "2026-01-23 13:32:29",
      "validationResponse": {
        "statusCode": "01",
        "status": "Invalid",
        "error": "",
        "invoiceStatuses": [
          {
            "itemSNo": "1",
            "statusCode": "01",
            "status": "Invalid",
            "invoiceNo": null,
            "errorCode": "0078",
            "error": "Valid Item Sr. No. is mandatory where SRO/Schedule No. is provided. Please refer to relevant reference API in the technical document for DI API for valid Item Sr. No. for the provided SRO/Schedule No."
          }
        ]
      }
    },
    "savedToDatabase": false
  }
}
```

**Response Field Explanations**:
- `status`: "success" when validated and saved, "validation_failed" when FBR validation failed
- `message`: Human-readable message describing the outcome
- `invoice`: Contains invoice data when saved, `null` when validation failed
- `fbrResponse`: Complete FBR API response (always included)
- `savedToDatabase`: Boolean indicating if invoice was saved to database
- `validationResponse.statusCode`: "00" = Valid, "01" or other = Invalid
- `validationResponse.status`: "Valid" or "Invalid"
- `invoiceStatuses`: Array of validation results for each item
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"buyerId\",\"message\":\"Buyer ID must be a valid UUID\"}]"
}
```

**404 Not Found** - Buyer Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Buyer not found"
}
```

**404 Not Found** - Scenario Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Scenario not found"
}
```

**404 Not Found** - HS Code Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "One or more HS codes not found"
}
```

**400 Bad Request** - Missing FBR Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "FBR test token not configured for this user"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**500 Internal Server Error** - FBR API Error:
```json
{
  "status": "error",
  "error": {
    "statusCode": 500
  },
  "message": "FBR API Error: Failed to post invoice"
}
```

---

### 1a. Post Invoice to FBR (Production Environment)

Submit an invoice to FBR's production system. This endpoint is for live transactions.

**Important Notes**: 
- This endpoint uses the production FBR API: `https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata`
- Requires a valid production token (`postInvoiceToken`) configured by admin
- Does NOT require `scenarioId` - specify `saleType` directly in each item
- `isTestEnvironment` is automatically set to `false`

**Prerequisites**: 
- Create buyers using `/buyers` endpoint
- Create HS codes using `/hs-codes` endpoint
- Ensure admin has configured your production FBR token

**Endpoint**: `POST /invoices/production`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "invoiceType": "Sale Invoice",
  "invoiceDate": "2026-01-17",
  "buyerId": "990e8400-e29b-41d4-a716-446655440001",
  "invoiceRefNo": "INV-2026-001",
  "items": [
    {
      "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
      "productDescription": "Sample Product",
      "rate": "18%",
      "uoM": "Numbers, pieces, units",
      "quantity": 1,
      "totalValues": 0,
      "valueSalesExcludingST": 1000,
      "fixedNotifiedValueOrRetailPrice": 0,
      "salesTaxApplicable": 180,
      "salesTaxWithheldAtSource": 0,
      "extraTax": 0,
      "furtherTax": 120,
      "sroScheduleNo": "SRO123",
      "fedPayable": 0,
      "discount": 0,
      "saleType": "Goods at standard rate (default)",
      "sroItemSerialNo": ""
    }
  ]
}
```

**Field Descriptions**:
- `invoiceType`: Type of invoice (e.g., "Sale Invoice") - required
- `invoiceDate`: Date in yyyy-MM-dd format - required
- `buyerId`: UUID of the buyer (must be created first) - required
- `invoiceRefNo`: Optional reference number
- `items`: Array of invoice items (at least 1 required)

**Seller Information** (automatically fetched from your user profile):
- Seller's NTN/CNIC
- Seller's business name
- Seller's province
- Seller's address

**Buyer Information** (fetched from buyer table using `buyerId`)
**HS Code** (fetched from hs_codes table using `hsCodeId` for each item)

**Item Fields**:
- `hsCodeId`: UUID of the HS Code (must be created first) - required
- `productDescription`: Description of the product - required
- `rate`: Tax rate (e.g., "18%") - required
- `uoM`: Unit of measurement (e.g., "Numbers, pieces, units") - required
- `quantity`: Quantity of items - required
- `totalValues`: Total value including tax - required
- `valueSalesExcludingST`: Value excluding sales tax - required
- `fixedNotifiedValueOrRetailPrice`: Fixed/retail price - required
- `salesTaxApplicable`: Applicable sales tax amount - required
- `salesTaxWithheldAtSource`: Tax withheld at source - required
- `extraTax`: Additional tax (use 0 for none) - required
- `furtherTax`: Further tax amount - required
- `sroScheduleNo`: SRO schedule number (optional)
- `fedPayable`: Federal excise duty payable - required
- `discount`: Discount amount - required
- `saleType`: Type of sale - **required** (e.g., "Goods at standard rate (default)")
- `sroItemSerialNo`: SRO item serial number (optional)

**Common Sale Types**:
- "Goods at standard rate (default)"
- "Goods at standard rate to registered buyers"
- "Goods at standard rate to unregistered buyers"
- "Goods at Reduced Rate"
- "Exempt Goods"
- "Goods at zero-rate"
- "Services"
- And other FBR-approved sale type descriptions

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/invoices/production \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceType": "Sale Invoice",
    "invoiceDate": "2026-01-17",
    "buyerId": "990e8400-e29b-41d4-a716-446655440001",
    "invoiceRefNo": "INV-2026-001",
    "items": [
      {
        "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
        "productDescription": "Sample Product",
        "rate": "18%",
        "uoM": "Numbers, pieces, units",
        "quantity": 1,
        "totalValues": 0,
        "valueSalesExcludingST": 1000,
        "fixedNotifiedValueOrRetailPrice": 0,
        "salesTaxApplicable": 180,
        "salesTaxWithheldAtSource": 0,
        "extraTax": 0,
        "furtherTax": 120,
        "sroScheduleNo": "SRO123",
        "fedPayable": 0,
        "discount": 0,
        "saleType": "Goods at standard rate (default)",
        "sroItemSerialNo": ""
      }
    ]
  }'
```

**Success Response - Valid Invoice (201 Created)**:

**Important**: The invoice is only saved to the database if the FBR validation response indicates success (statusCode "00"). Check the `savedToDatabase` field and `status` to determine if the invoice was saved.

```json
{
  "status": "success",
  "message": "Invoice posted and saved successfully",
  "data": {
    "invoice": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "buyerId": "990e8400-e29b-41d4-a716-446655440001",
      "scenarioId": null,
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2026-01-17T00:00:00.000Z",
      "invoiceRefNo": "INV-2026-001",
      "fbrInvoiceNumber": "3520223926179DIABXVCA566695",
      "fbrResponse": {
        "invoiceNumber": "3520223926179DIABXVCA566695",
        "dated": "2026-01-23 21:02:52",
        "validationResponse": {
          "statusCode": "00",
          "status": "Valid",
          "error": "",
          "invoiceStatuses": [
            {
              "itemSNo": "1",
              "statusCode": "00",
              "status": "Valid",
              "invoiceNo": "3520223926179DIABXVCA566695-1",
              "errorCode": "",
              "error": ""
            }
          ]
        }
      },
      "isTestEnvironment": false,
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z",
      "items": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440001",
          "invoiceId": "770e8400-e29b-41d4-a716-446655440001",
          "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
          "productDescription": "Sample Product",
          "rate": "18%",
          "uoM": "Numbers, pieces, units",
          "quantity": "1",
          "totalValues": "0.00",
          "valueSalesExcludingST": "1000.00",
          "fixedNotifiedValueOrRetailPrice": "0.00",
          "salesTaxApplicable": "180.00",
          "salesTaxWithheldAtSource": "0.00",
          "extraTax": "0.00",
          "furtherTax": "120.00",
          "sroScheduleNo": "SRO123",
          "fedPayable": "0.00",
          "discount": "0.00",
          "saleType": "Goods at standard rate (default)",
          "sroItemSerialNo": "",
          "createdAt": "2026-01-17T10:00:00.000Z",
          "updatedAt": "2026-01-17T10:00:00.000Z",
          "hsCode": {
            "id": "bb0e8400-e29b-41d4-a716-446655440001",
            "hsCode": "0101.2100",
            "description": "Sample product category"
          }
        }
      ],
      "buyer": {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "ntncnic": "9876543210987",
        "businessName": "XYZ Corporation",
        "province": "Sindh",
        "address": "456 Business Avenue, Karachi",
        "registrationType": "Unregistered"
      }
    },
    "fbrResponse": {
      "invoiceNumber": "3520223926179DIABXVCA566695",
      "dated": "2026-01-23 21:02:52",
      "validationResponse": {
        "statusCode": "00",
        "status": "Valid",
        "error": "",
        "invoiceStatuses": [
          {
            "itemSNo": "1",
            "statusCode": "00",
            "status": "Valid",
            "invoiceNo": "3520223926179DIABXVCA566695-1",
            "errorCode": "",
            "error": ""
          }
        ]
      }
    },
    "savedToDatabase": true
  }
}
```

**Validation Failed Response - Invalid Invoice (200 OK)**:

When FBR returns a validation error (statusCode "01" or any non-"00" code), the invoice is NOT saved to the database:

```json
{
  "status": "validation_failed",
  "message": "Invoice posted to FBR but validation failed. Invoice not saved.",
  "data": {
    "invoice": null,
    "fbrResponse": {
      "dated": "2026-01-23 13:32:29",
      "validationResponse": {
        "statusCode": "01",
        "status": "Invalid",
        "error": "",
        "invoiceStatuses": [
          {
            "itemSNo": "1",
            "statusCode": "01",
            "status": "Invalid",
            "invoiceNo": null,
            "errorCode": "0078",
            "error": "Valid Item Sr. No. is mandatory where SRO/Schedule No. is provided. Please refer to relevant reference API in the technical document for DI API for valid Item Sr. No. for the provided SRO/Schedule No."
          }
        ]
      }
    },
    "savedToDatabase": false
  }
}
```

**Response Field Explanations**:
- `status`: "success" when validated and saved, "validation_failed" when FBR validation failed
- `message`: Human-readable message describing the outcome
- `invoice`: Contains invoice data when saved, `null` when validation failed
- `fbrResponse`: Complete FBR API response (always included)
- `savedToDatabase`: Boolean indicating if invoice was saved to database
- `validationResponse.statusCode`: "00" = Valid, "01" or other = Invalid
- `validationResponse.status`: "Valid" or "Invalid"
- `invoiceStatuses`: Array of validation results for each item
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"buyerId\",\"message\":\"Buyer ID must be a valid UUID\"}]"
}
```

**400 Bad Request** - Missing Production Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Production FBR token not configured for this user. Please contact admin."
}
```

**404 Not Found** - Buyer Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Buyer not found"
}
```

**404 Not Found** - HS Code Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "One or more HS codes not found"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**500 Internal Server Error** - FBR API Error:
```json
{
  "status": "error",
  "error": {
    "statusCode": 500
  },
  "message": "FBR API Error: Failed to post invoice"
}
```

**500 Internal Server Error** - FBR Connection Error:
```json
{
  "status": "error",
  "error": {
    "statusCode": 500
  },
  "message": "Failed to connect to FBR API: Connection timeout"
}
```

---

### 2. Validate Invoice with FBR

Validate an invoice number with FBR's system.

**Endpoint**: `POST /invoices/validate`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "invoiceNumber": "FBR123456789",
  "isTestEnvironment": true
}
```

**Field Descriptions**:
- `invoiceNumber`: FBR invoice number to validate (required)
- `isTestEnvironment`: true for sandbox, false for production (default: true)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/invoices/validate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invoiceNumber":"FBR123456789","isTestEnvironment":true}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "invoiceNumber": "FBR123456789",
    "validationResult": {
      "status": "valid",
      "message": "Invoice is valid",
      "invoiceDetails": {
        "invoiceNumber": "FBR123456789",
        "invoiceDate": "2026-01-17",
        "sellerNTN": "1234567890123",
        "buyerNTN": "9876543210987",
        "totalAmount": 1000
      }
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Missing Invoice Number:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"invoiceNumber\",\"message\":\"Invoice number is required\"}]"
}
```

**400 Bad Request** - Missing FBR Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "FBR test validation token not configured for this user"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

---

### 3. Get User Invoices

Get a paginated list of invoices for the authenticated user with optional filtering.

**Endpoint**: `GET /invoices`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `invoiceType` (optional): Filter by invoice type
- `isTestEnvironment` (optional): Filter by environment (true or false)
- `startDate` (optional): Filter by start date (yyyy-MM-dd)
- `endDate` (optional): Filter by end date (yyyy-MM-dd)

**cURL Request**:
```bash
# Get all invoices (page 1, 10 per page)
curl -X GET "http://localhost:5000/api/v1/invoices" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With pagination
curl -X GET "http://localhost:5000/api/v1/invoices?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by invoice type
curl -X GET "http://localhost:5000/api/v1/invoices?invoiceType=Sale%20Invoice" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by environment
curl -X GET "http://localhost:5000/api/v1/invoices?isTestEnvironment=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by date range
curl -X GET "http://localhost:5000/api/v1/invoices?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "invoices": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "invoiceType": "Sale Invoice",
        "invoiceDate": "2026-01-17T00:00:00.000Z",
        "sellerNTNCNIC": "1234567890123",
        "sellerBusinessName": "ABC Trading Company",
        "sellerProvince": "Punjab",
        "sellerAddress": "123 Main Street, Lahore",
        "buyerNTNCNIC": "9876543210987",
        "buyerBusinessName": "XYZ Corporation",
        "buyerProvince": "Sindh",
        "buyerAddress": "456 Business Avenue, Karachi",
        "buyerRegistrationType": "Registered",
        "invoiceRefNo": "INV-2026-001",
        "scenarioId": "SN000",
        "fbrInvoiceNumber": "FBR123456789",
        "fbrResponse": {},
        "isTestEnvironment": true,
        "createdAt": "2026-01-17T10:00:00.000Z",
        "updatedAt": "2026-01-17T10:00:00.000Z",
        "items": [
          {
            "id": "880e8400-e29b-41d4-a716-446655440001",
            "invoiceId": "770e8400-e29b-41d4-a716-446655440001",
            "hsCode": "0000.0000",
            "productDescription": "Sample Product",
            "rate": "17%",
            "uoM": "PCS",
            "quantity": "10",
            "totalValues": "1000.00",
            "valueSalesExcludingST": "854.70",
            "fixedNotifiedValueOrRetailPrice": "1000.00",
            "salesTaxApplicable": "145.30",
            "salesTaxWithheldAtSource": "0.00",
            "extraTax": "",
            "furtherTax": "0.00",
            "sroScheduleNo": "",
            "fedPayable": "0.00",
            "discount": "0.00",
            "saleType": "",
            "sroItemSerialNo": "",
            "createdAt": "2026-01-17T10:00:00.000Z",
            "updatedAt": "2026-01-17T10:00:00.000Z"
          }
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

---

### 4. Get Invoice by ID

Get detailed information about a specific invoice.

**Endpoint**: `GET /invoices/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**URL Parameters**:
- `id`: Invoice ID (UUID)

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/invoices/770e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "invoice": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2026-01-17T00:00:00.000Z",
      "sellerNTNCNIC": "1234567890123",
      "sellerBusinessName": "ABC Trading Company",
      "sellerProvince": "Punjab",
      "sellerAddress": "123 Main Street, Lahore",
      "buyerNTNCNIC": "9876543210987",
      "buyerBusinessName": "XYZ Corporation",
      "buyerProvince": "Sindh",
      "buyerAddress": "456 Business Avenue, Karachi",
      "buyerRegistrationType": "Registered",
      "invoiceRefNo": "INV-2026-001",
      "scenarioId": "SN000",
      "fbrInvoiceNumber": "FBR123456789",
      "fbrResponse": {},
      "isTestEnvironment": true,
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z",
      "items": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440001",
          "invoiceId": "770e8400-e29b-41d4-a716-446655440001",
          "hsCode": "0000.0000",
          "productDescription": "Sample Product",
          "rate": "17%",
          "uoM": "PCS",
          "quantity": "10",
          "totalValues": "1000.00",
          "valueSalesExcludingST": "854.70",
          "fixedNotifiedValueOrRetailPrice": "1000.00",
          "salesTaxApplicable": "145.30",
          "salesTaxWithheldAtSource": "0.00",
          "extraTax": "",
          "furtherTax": "0.00",
          "sroScheduleNo": "",
          "fedPayable": "0.00",
          "discount": "0.00",
          "saleType": "",
          "sroItemSerialNo": "",
          "createdAt": "2026-01-17T10:00:00.000Z",
          "updatedAt": "2026-01-17T10:00:00.000Z"
        }
      ],
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Xenax_33",
        "email": "admin@fbr.gov.pk",
        "businessName": "FBR Admin"
      }
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**404 Not Found** - Invoice Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Invoice not found"
}
```

---

### 5. Delete Invoice

Delete an invoice (only the user who created it can delete it).

**Endpoint**: `DELETE /invoices/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**URL Parameters**:
- `id`: Invoice ID (UUID)

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/invoices/770e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**404 Not Found** - Invoice Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Invoice not found"
}
```

---

## Invoice Print Settings APIs

The Invoice Print Settings API allows users to customize which invoice item fields to display in printed PDFs, adjust column widths, and configure custom fields inclusion. Each user has their own print settings with sensible defaults.

### Base Route
`/api/v1/invoice-print-settings`

### Authentication
All endpoints require JWT authentication via Bearer token.

---

### 1. Get Print Settings

Retrieves the current user's print settings. If no custom settings exist, returns default settings.

**Endpoint**: `GET /api/v1/invoice-print-settings`

**Authentication**: Required

**Response (200 OK) - With Custom Settings**:
```json
{
  "status": "success",
  "data": {
    "printSettings": {
      "id": "uuid",
      "userId": "uuid",
      "visibleFields": [
        "itemNumber",
        "productDescription",
        "customField_123e4567-e89b-12d3-a456-426614174000",
        "hsCode",
        "quantity",
        "customField_223e4567-e89b-12d3-a456-426614174001",
        "uoM",
        "totalValues",
        "valueSalesExcludingST",
        "salesTaxApplicable"
      ],
      "columnWidths": {
        "itemNumber": 5,
        "productDescription": 20,
        "customField_123e4567-e89b-12d3-a456-426614174000": 12,
        "hsCode": 10,
        "quantity": 8,
        "customField_223e4567-e89b-12d3-a456-426614174001": 10,
        "uoM": 6,
        "totalValues": 10,
        "valueSalesExcludingST": 10,
        "salesTaxApplicable": 10
      },
      "fontSize": "small",
      "tableBorders": true,
      "showItemNumbers": true,
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-01T10:00:00.000Z"
    }
  }
}
```

**Note:** Custom fields are included in `visibleFields` array with `customField_` prefix followed by the UUID. They can be positioned anywhere among regular fields for flexible drag-and-drop ordering.

**Response (200 OK) - No Custom Settings**:
```json
{
  "status": "success",
  "data": {
    "printSettings": null,
    "defaultSettings": {
      "visibleFields": [
        "itemNumber",
        "productDescription",
        "hsCode",
        "quantity",
        "uoM",
        "rate",
        "totalValues",
        "valueSalesExcludingST",
        "salesTaxApplicable"
      ],
      "columnWidths": {
        "itemNumber": 5,
        "productDescription": 20,
        "hsCode": 10,
        "quantity": 8,
        "uoM": 6,
        "rate": 8,
        "totalValues": 10,
        "valueSalesExcludingST": 10,
        "fixedNotifiedValueOrRetailPrice": 10,
        "salesTaxApplicable": 10,
        "salesTaxWithheldAtSource": 10,
        "furtherTax": 8,
        "fedPayable": 8,
        "discount": 8,
        "sroScheduleNo": 10,
        "sroItemSerialNo": 10
      },
      "fontSize": "small",
      "tableBorders": true,
      "showItemNumbers": true
    }
  }
}
```

---

### 2. Save Print Settings

Creates or updates print settings for the current user (upsert logic). Supports custom fields with `customField_` prefix for flexible positioning.

**Endpoint**: `POST /api/v1/invoice-print-settings`

**Authentication**: Required

**Request Body**:
```json
{
  "visibleFields": [
    "itemNumber",
    "productDescription",
    "customField_123e4567-e89b-12d3-a456-426614174000",
    "quantity",
    "totalValues"
  ],
  "columnWidths": {
    "itemNumber": 8,
    "productDescription": 30,
    "customField_123e4567-e89b-12d3-a456-426614174000": 12,
    "quantity": 12,
    "totalValues": 15
  },
  "fontSize": "medium",
  "tableBorders": true,
  "showItemNumbers": true
}
```

**Field Descriptions**:
- `visibleFields` (array, required): Array of field keys including custom fields with `customField_` prefix (1-20 fields total)
- `columnWidths` (object, required): Width percentages for all visible fields (1-50 per field)
- `fontSize` (string, required): Font size - "small", "medium", or "large"
- `tableBorders` (boolean, required): Whether to show table borders
- `showItemNumbers` (boolean, required): Whether to show item numbers

**Custom Field Format**:
- Regular fields: Use field key directly (e.g., `"productDescription"`)
- Custom fields: Use `"customField_"` + UUID (e.g., `"customField_123e4567-e89b-12d3-a456-426614174000"`)
- Custom fields can be positioned anywhere in the `visibleFields` array for drag-and-drop ordering

**Validation Rules**:
- `visibleFields`: Array of strings, at least 1 field, maximum 20 fields (including custom fields)
- `columnWidths`: Values must be numbers between 1 and 50
- `fontSize`: Must be "small", "medium", or "large"
- Total column widths should ideally sum to 100 (warning if not)
- Custom field IDs must be valid UUIDs, belong to user, and be active

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Print settings saved successfully",
  "data": {
    "printSettings": {
      "id": "uuid",
      "userId": "uuid",
      "visibleFields": [
        "itemNumber",
        "productDescription",
        "customField_123e4567-e89b-12d3-a456-426614174000",
        "quantity",
        "totalValues"
      ],
      "columnWidths": {
        "itemNumber": 8,
        "productDescription": 30,
        "customField_123e4567-e89b-12d3-a456-426614174000": 12,
        "quantity": 12,
        "totalValues": 15
      },
      "fontSize": "medium",
      "tableBorders": true,
      "showItemNumbers": true,
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-01T10:30:00.000Z"
    }
  },
  "warning": "Total column width is 77%. Recommended: 100%"
}
```

**Error Response (400 Bad Request - Invalid Custom Field)**:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "errors": [
      {
        "field": "customField_123e4567-e89b-12d3-a456-426614174000",
        "message": "Custom field not found, inactive, or does not belong to your account"
      }
    ]
  },
  "message": "Validation failed: 1 custom field(s) are invalid"
}
```

**Error Response (400 Bad Request - Validation)**:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "errors": [
      {
        "field": "visibleFields",
        "message": "visibleFields must be an array with 1-15 fields"
      },
      {
        "field": "fontSize",
        "message": "fontSize must be \"small\", \"medium\", or \"large\""
      }
    ]
  },
  "message": "Validation failed"
}
```

---

### 3. Reset Print Settings

Deletes user's custom settings, resetting to default settings.

**Endpoint**: `DELETE /api/v1/invoice-print-settings`

**Authentication**: Required

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Print settings reset to defaults"
}
```

---

### 4. Get Available Fields

Returns metadata about all available fields for printing, including field names, labels, descriptions, categories, width constraints, and the user's active custom fields.

**Endpoint**: `GET /api/v1/invoice-print-settings/available-fields`

**Authentication**: Required

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "fields": [
      {
        "key": "itemNumber",
        "label": "Item #",
        "description": "Item serial number",
        "category": "basic",
        "defaultVisible": true,
        "minWidth": 5,
        "maxWidth": 10,
        "required": false
      },
      {
        "key": "productDescription",
        "label": "Product Description",
        "description": "Description of the product",
        "category": "basic",
        "defaultVisible": true,
        "minWidth": 15,
        "maxWidth": 40,
        "required": true
      },
      // ... (all 16 regular fields)
    ],
    "customFields": [
      {
        "key": "customField_123e4567-e89b-12d3-a456-426614174000",
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "label": "Purchase Order Number",
        "fieldName": "Purchase Order Number",
        "fieldType": "text",
        "description": "Custom field: Purchase Order Number",
        "category": "custom",
        "defaultVisible": false,
        "minWidth": 8,
        "maxWidth": 20,
        "required": false
      },
      {
        "key": "customField_223e4567-e89b-12d3-a456-426614174001",
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "label": "Delivery Date",
        "fieldName": "Delivery Date",
        "fieldType": "date",
        "description": "Custom field: Delivery Date",
        "category": "custom",
        "defaultVisible": false,
        "minWidth": 8,
        "maxWidth": 15,
        "required": false
      }
    ],
    "categories": [
      { "key": "basic", "label": "Basic Information", "order": 1 },
      { "key": "pricing", "label": "Pricing & Values", "order": 2 },
      { "key": "tax", "label": "Tax Information", "order": 3 },
      { "key": "compliance", "label": "Compliance & SRO", "order": 4 },
      { "key": "custom", "label": "Custom Fields", "order": 5 }
    ]
  }
}
```

**Field Metadata Properties**:
- `key`: Unique identifier for the field (regular fields: field name, custom fields: `customField_` + UUID)
- `label`: Display name for the field
- `description`: Detailed description of the field
- `category`: Category the field belongs to (basic, pricing, tax, compliance, custom)
- `defaultVisible`: Whether the field is visible by default
- `minWidth`: Minimum recommended column width percentage
- `maxWidth`: Maximum recommended column width percentage
- `required`: Whether the field must always be included

**Custom Field Additional Properties**:
- `id`: The UUID of the custom field
- `fieldName`: Original custom field name
- `fieldType`: Type of custom field (text, number, date, textarea)

**Notes**:
- Regular fields are always returned in the `fields` array
- User's active custom fields are returned in the `customFields` array
- Inactive or deleted custom fields are not included
- Frontend can combine both arrays for field selection UI

---

## Error Responses

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

### Error Response Format

All errors follow this format:

```json
{
  "status": "fail" | "error",
  "error": {
    "statusCode": 400,
    // Additional error details in development mode
  },
  "message": "Error message here"
}
```

### Validation Errors

Validation errors return an array of field-specific errors:

```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"},{\"field\":\"password\",\"message\":\"Password must be at least 8 characters long\"}]"
}
```

---

## Authentication Flow

1. **Login**: Call `/auth/login` with email and password
2. **Store Tokens**: Save both `accessToken` and `refreshToken`
3. **API Requests**: Include `accessToken` in `Authorization: Bearer <token>` header
4. **Token Expiry**: When access token expires (401 error), call `/auth/refresh`
5. **Logout**: Call `/auth/logout` with refresh token to invalidate session

---

## Testing with cURL

### Complete Flow Example

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fbr.gov.pk","password":"Admin@123"}'

# Save the accessToken and refreshToken from response

# 2. Create a new user
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","businessName":"Test Business","province":"Punjab","address":"Test Address","ntncnic":"1234567890123","password":"TestPass@123"}'

# 3. Get all users
curl -X GET http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Logout
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- User IDs are UUIDs (v4)
- Access tokens expire in 24 hours
- Refresh tokens expire in 7 days
- All API endpoints return JSON responses
- Passwords are hashed using bcrypt (12 rounds)
- NTN/CNIC must be exactly 13 digits

---

**Last Updated**: January 14, 2026
**Version**: 1.0.0
