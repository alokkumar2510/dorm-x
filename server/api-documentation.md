# DORM-X API Documentation

This document describes the API endpoints, schemas, request payloads, response formats, and security mechanisms for the DORM-X Backend.

## Overview & Architecture

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT-based session security. Access tokens are short-lived (15 minutes), while refresh tokens are long-lived (7 days) and are stored in HTTP-Only cookies to protect against XSS.
- **Refresh Token Rotation**: Upon calling `/auth/refresh`, the old refresh token is invalidated, and a brand new one is issued to prevent session replay attacks.
- **RBAC (Role-Based Access Control)**: Endpoints are gated based on roles: `STUDENT`, `WARDEN`, `SECURITY`, `PARENT`.

---

## Authentication APIs

### 1. Register User
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Description**: Creates a new user. For students and parents, they can link their accounts by providing `studentEmail`. Also takes a `hostel` code/name to resolve and link the relational Hostel.
- **Request Body**:
```json
{
  "email": "student@dormx.edu",
  "password": "SecurePassword123",
  "name": "Alex Mercer",
  "role": "STUDENT",
  "hostel": "PULAHA", // Resolves to Hostel relation
  "room": "101",
  "phone": "+1234567890",
  "studentEmail": "parent@email.com" // Optional: links parent-student
}
```
- **Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "e91b5c46-9d8a-493e-b152-09419cfad99a",
    "email": "student@dormx.edu",
    "name": "Alex Mercer",
    "role": "STUDENT",
    "hostelId": "a90b8f41-09df-415b-99aa-67c80dfa2123",
    "hostel": {
      "id": "a90b8f41-09df-415b-99aa-67c80dfa2123",
      "name": "Pulaha Hostel",
      "code": "PULAHA"
    },
    "room": "101",
    "phone": "+1234567890",
    "parentId": "3b2e75cb-826c-4b53-90d1-d227b99c7590",
    "createdAt": "2026-06-10T08:00:00.000Z"
  }
}
```

### 2. Login User
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Description**: Verifies credentials and sets `accessToken` and `refreshToken` in HTTP-Only cookies. The access token is also returned in the response body.
- **Request Body**:
```json
{
  "email": "student@dormx.edu",
  "password": "SecurePassword123"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "e91b5c46-9d8a-493e-b152-09419cfad99a",
    "email": "student@dormx.edu",
    "name": "Alex Mercer",
    "role": "STUDENT",
    "hostelId": "a90b8f41-09df-415b-99aa-67c80dfa2123",
    "room": "101",
    "phone": "+1234567890"
  }
}
```

### 3. Refresh Access Token
- **Endpoint**: `POST /auth/refresh`
- **Access**: Public (requires valid `refreshToken` cookie)
- **Description**: Invalidates the old refresh token, generates a new refresh token (token rotation), and returns a new access token.
- **Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "e91b5c46-9d8a-493e-b152-09419cfad99a",
    "email": "student@dormx.edu",
    "name": "Alex Mercer",
    "role": "STUDENT"
  }
}
```

### 4. Logout User
- **Endpoint**: `POST /auth/logout`
- **Access**: Public
- **Description**: Revokes the current refresh token from the database and clears authentication cookies.
- **Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

## Leave / Outpass APIs

### 1. Apply for Leave / Outpass
- **Endpoint**: `POST /leaves/apply`
- **Access**: Protected (Role: `STUDENT` only)
- **Request Body**:
```json
{
  "startDate": "2026-06-12T17:00:00.000Z",
  "endDate": "2026-06-14T20:00:00.000Z",
  "reason": "Visiting family for the weekend",
  "type": "OUTPASS" // "OUTPASS" | "VACATION" | "EMERGENCY"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Leave request submitted successfully",
  "leave": {
    "id": "4c45b780-e889-42b7-a37a-8ee0790e0b3c",
    "studentId": "e91b5c46-9d8a-493e-b152-09419cfad99a",
    "startDate": "2026-06-12T17:00:00.000Z",
    "endDate": "2026-06-14T20:00:00.000Z",
    "reason": "Visiting family for the weekend",
    "type": "OUTPASS",
    "status": "PENDING",
    "createdAt": "2026-06-10T08:15:00.000Z",
    "updatedAt": "2026-06-10T08:15:00.000Z"
  }
}
```

### 2. Cancel Leave Request
- **Endpoint**: `POST /leaves/cancel/:id`
- **Access**: Protected (Role: `STUDENT` or `WARDEN` / only student's own requests)
- **Description**: Cancels a pending or approved leave request before exit scanning has occurred.
- **Response (200 OK)**:
```json
{
  "message": "Leave request cancelled successfully",
  "leave": {
    "id": "4c45b780-e889-42b7-a37a-8ee0790e0b3c",
    "status": "CANCELLED"
  }
}
```

### 3. Get Leave History
- **Endpoint**: `GET /leaves/history`
- **Access**: Protected (Role: `STUDENT`, `PARENT`, `WARDEN`, `SECURITY`)
- **Query Parameters**:
  - `status`: Filter by leave status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`)
  - `type`: Filter by leave type (`OUTPASS`, `VACATION`, `EMERGENCY`)
  - `hostel`: Filter by student hostel (Warden only)
- **Response (200 OK)**:
```json
{
  "leaves": [
    {
      "id": "4c45b780-e889-42b7-a37a-8ee0790e0b3c",
      "startDate": "2026-06-12T17:00:00.000Z",
      "endDate": "2026-06-14T20:00:00.000Z",
      "reason": "Visiting family for the weekend",
      "type": "OUTPASS",
      "status": "PENDING",
      "student": {
        "id": "e91b5c46-9d8a-493e-b152-09419cfad99a",
        "name": "Alex Mercer",
        "email": "student@dormx.edu",
        "hostelId": "a90b8f41-09df-415b-99aa-67c80dfa2123",
        "room": "101"
      },
      "warden": null
    }
  ]
}
```

### 4. Approve or Reject Leave Request
- **Endpoint**: `PATCH /leaves/approve/:id`
- **Access**: Protected (Role: `WARDEN` only)
- **Request Body**:
```json
{
  "status": "APPROVED", // "APPROVED" or "REJECTED"
  "comments": "Have a safe trip!"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Leave request approved successfully",
  "leave": {
    "id": "4c45b780-e889-42b7-a37a-8ee0790e0b3c",
    "status": "APPROVED",
    "comments": "Have a safe trip!",
    "warden": {
      "name": "Warden Smith"
    }
  }
}
```

### 5. Scan pass (Gate Entry/Exit Verification)
- **Endpoint**: `POST /leaves/scan`
- **Access**: Protected (Role: `SECURITY` only)
- **Description**: Verifies and logs exit/entry scans. Supports traditional ID scan, dynamic time-bound QR verification, RFID matching, or facial recognition embeddings.
- **Request Body**:
  - Accept one of the following:
```json
{
  "id": "4c45b780-e889-42b7-a37a-8ee0790e0b3c" // Option A: Standard Leave ID
}
```
```json
{
  "qrToken": "ZXk1aGJH...HMAC_Token" // Option B: Dynamic QR (HMAC-signed with 60s validity)
}
```
```json
{
  "rfidTag": "RFID_TAG_993412" // Option C: RFID card code
}
```
```json
{
  "faceDescriptor": "[0.123, -0.456, 0.789, ...]" // Option D: Vector signature
}
```
- **Response (200 OK) - Exit Case**:
```json
{
  "message": "Exit scanned successfully. Student checked out.",
  "action": "EXIT",
  "leave": {
    "id": "4c45b780-e889-42b7-a37a-8ee0790e0b3c",
    "exitTime": "2026-06-12T17:05:21.000Z",
    "securityIdExit": "5dbefc23-7fa5-4de4-857c-67c80dfa2123"
  }
}
```

---

## Security Operation APIs

### 1. Log Courier Parcel Delivery
- **Endpoint**: `POST /security/courier`
- **Access**: Protected (Role: `SECURITY` only)
- **Request Body**:
```json
{
  "recipientEmail": "student@dormx.edu",
  "vendor": "Amazon",
  "trackingNumber": "AMZN123456789" // Optional
}
```
- **Response (201 Created)**:
```json
{
  "message": "Courier logged successfully",
  "logistics": {
    "id": "d12a9c3b-48df-419b-a010-8b1b87a6cbe3",
    "recipientId": "e91b5c46-9d8a-493e-b152-09419cfad99a",
    "vendor": "Amazon",
    "trackingNumber": "AMZN123456789",
    "status": "RECEIVED_AT_GATE",
    "securityId": "5dbefc23-7fa5-4de4-857c-67c80dfa2123",
    "receivedAt": "2026-06-10T08:30:00.000Z"
  }
}
```

### 2. Mark Courier Collected
- **Endpoint**: `PATCH /security/courier/collect/:id`
- **Access**: Protected (Role: `SECURITY` only)
- **Response (200 OK)**:
```json
{
  "message": "Courier status updated to collected",
  "logistics": {
    "id": "d12a9c3b-48df-419b-a010-8b1b87a6cbe3",
    "status": "COLLECTED",
    "collectedAt": "2026-06-10T16:45:00.000Z"
  }
}
```

### 3. Log Visitor Entry
- **Endpoint**: `POST /security/visitor`
- **Access**: Protected (Role: `SECURITY` only)
- **Request Body**:
```json
{
  "visitorName": "Mark Mercer",
  "hostel": "PULAHA", // Hostel ID, Code, or Name
  "room": "101",
  "purpose": "Local guardian visit",
  "studentEmail": "student@dormx.edu"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Visitor checked in successfully",
  "visitor": {
    "id": "f8a7e6b5-9012-4cbe-b3b3-cd124b89e782",
    "visitorName": "Mark Mercer",
    "hostelId": "a90b8f41-09df-415b-99aa-67c80dfa2123",
    "room": "101",
    "purpose": "Local guardian visit",
    "studentId": "e91b5c46-9d8a-493e-b152-09419cfad99a",
    "entryTime": "2026-06-10T08:45:00.000Z"
  }
}
```

### 4. Checkout Visitor
- **Endpoint**: `PATCH /security/visitor/checkout/:id`
- **Access**: Protected (Role: `SECURITY` only)
- **Response (200 OK)**:
```json
{
  "message": "Visitor checked out successfully",
  "visitor": {
    "id": "f8a7e6b5-9012-4cbe-b3b3-cd124b89e782",
    "exitTime": "2026-06-10T11:15:00.000Z"
  }
}
```

### 5. Toggle System Lockdown
- **Endpoint**: `POST /security/lockdown`
- **Access**: Protected (Role: `SECURITY`, `WARDEN` only)
- **Request Body**:
```json
{
  "active": true
}
```
- **Response (200 OK)**:
```json
{
  "message": "Lockdown state toggled to true",
  "settings": {
    "id": "55c4d62b-67a8-48b4-9092-2cb03ba6e709",
    "lockdownActive": true,
    "crowdAlertActive": false
  }
}
```

---

## Offline Synchronization APIs

### 1. Reconcile Offline Scans
- **Endpoint**: `POST /sync/offline`
- **Access**: Protected (Role: `SECURITY` only)
- **Description**: Reconciles a list of checkouts and check-ins scanned by the guard's device during connection outages. Runs transactional status checks.
- **Request Body**:
```json
{
  "scans": [
    {
      "leaveRequestId": "4c45b780-e889-42b7-a37a-8ee0790e0b3c",
      "action": "EXIT",
      "scannedAt": "2026-06-10T09:12:00.000Z",
      "securityId": "5dbefc23-7fa5-4de4-857c-67c80dfa2123"
    },
    {
      "leaveRequestId": "8aa1b980-df89-43c3-882a-e8e0790e0b3c",
      "action": "ENTRY",
      "scannedAt": "2026-06-10T09:15:00.000Z",
      "securityId": "5dbefc23-7fa5-4de4-857c-67c80dfa2123"
    }
  ]
}
```
- **Response (200 OK)**:
```json
{
  "message": "Offline sync complete",
  "syncedCount": 2,
  "syncedIds": [
    "4c45b780-e889-42b7-a37a-8ee0790e0b3c",
    "8aa1b980-df89-43c3-882a-e8e0790e0b3c"
  ],
  "failures": []
}
```

---

## Reports & Exporters

### 1. Export Leave Outpasses Report
- **Endpoint**: `GET /reports/leaves`
- **Access**: Protected (Role: `WARDEN`, `SECURITY` only)
- **Query Parameters**:
  - `hostelId`: Filter by hostel UUID
  - `status`: Filter by outpass status
  - `type`: Filter by leave type
  - `startDate`: Filter creation date (greater than or equal to)
  - `endDate`: Filter creation date (less than or equal to)
- **Response**: File Download (Stream `text/csv`) - Filename: `leaves-report.csv`

### 2. Export Visitor Logs Report
- **Endpoint**: `GET /reports/visitors`
- **Access**: Protected (Role: `SECURITY` only)
- **Query Parameters**:
  - `hostelId`: Filter by hostel UUID
  - `startDate`, `endDate`: Filter range
- **Response**: File Download (Stream `text/csv`) - Filename: `visitors-report.csv`

---

## User Dashboard & Notification APIs

### 1. Fetch User Profile
- **Endpoint**: `GET /users/profile`
- **Access**: Protected (All Roles)
- **Response (200 OK)**:
```json
{
  "user": {
    "id": "e91b5c46-9d8a-493e-b152-09419cfad99a",
    "email": "student@dormx.edu",
    "name": "Alex Mercer",
    "role": "STUDENT",
    "hostelId": "a90b8f41-09df-415b-99aa-67c80dfa2123",
    "room": "101",
    "phone": "+1234567890",
    "parentId": "3b2e75cb-826c-4b53-90d1-d227b99c7590"
  }
}
```

### 2. Fetch Student Dashboard
- **Endpoint**: `GET /users/dashboard/student`
- **Access**: Protected (Role: `STUDENT` only)
- **Response (200 OK)**:
```json
{
  "liveStatus": "IN_HOSTEL",
  "stats": {
    "totalOutpasses": 12,
    "pendingCount": 1,
    "approvedCount": 8,
    "rejectedCount": 3
  },
  "recentLeaves": [...],
  "recentNotifications": [...]
}
```

### 3. Fetch Parent Dashboard
- **Endpoint**: `GET /users/dashboard/parent`
- **Access**: Protected (Role: `PARENT` only)
- **Response (200 OK)**:
```json
{
  "students": [
    {
      "id": "e91b5c46-9d8a-493e-b152-09419cfad99a",
      "name": "Alex Mercer",
      "email": "student@dormx.edu",
      "hostel": "Pulaha Hostel",
      "room": "101",
      "liveStatus": "IN_HOSTEL",
      "recentLeaves": [...]
    }
  ],
  "recentNotifications": [...]
}
```

### 4. Fetch Warden Dashboard
- **Endpoint**: `GET /users/dashboard/warden`
- **Access**: Protected (Role: `WARDEN` only)
- **Response (200 OK)**:
```json
{
  "hostel": "Pulaha Hostel",
  "stats": {
    "totalStudents": 150,
    "insideCount": 142,
    "outsideCount": 8,
    "pendingApprovals": 3,
    "lockdownActive": false,
    "crowdAlertActive": false
  },
  "pendingLeaves": [...]
}
```

### 5. Fetch Notifications Feed
- **Endpoint**: `GET /users/notifications`
- **Access**: Protected (All Roles)
- **Response (200 OK)**:
```json
{
  "notifications": [...]
}
```
